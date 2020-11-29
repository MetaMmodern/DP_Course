const { Stream } = require("stream");
const { scan, scan_numbers } = require("./scan_helpers");
const chalk = require("chalk");

module.exports = function lexer(fileStream) {
  let state = {
    line: 1,
    column: 1,
  };
  const lexemStream = Stream.Duplex({
    writableObjectMode: true,
    readableObjectMode: true,
  });
  lexemStream._read = () => {};
  lexemStream._write = () => {};

  function linesWatcher(span) {
    state = { ...state, column: state.column + span };
  }
  function undefineder(lexeme, chunk) {
    fileStream.pause();
    lexeme.token.undefined_token = chunk.toString();
    const error = {
      message: "UNDEFINED_TOKEN",
      lexeme,
    };
    fileStream.destroy(error);
  }
  function wordsReader(lexeme, chunk) {
    fileStream.unshift(chunk);
    const scanned = scan(fileStream, " ");
    lexeme.srcloc.span = scanned.length;
    if (["print", "goto", "end"].includes(scanned)) {
      //functions
      lexeme.token[scanned] = scanned;
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(scanned.length);
    } else if (scanned === "rem") {
      //COMMENTS
      const comment = scan(fileStream, "\n");
      lexeme.token.rem = comment;
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(scanned.length);
    } else {
      //undefined lexems
      undefineder(lexeme, chunk);
    }
  }
  function stringsReader(lexeme, chunk) {
    const scanned = scan(fileStream, chunk.toString());
    lexeme.token.string = scanned;
    lexeme.srcloc.span = scanned.length + 2;
    lexemStream.push(JSON.stringify(lexeme));
    linesWatcher(scanned.length + 2);
    fileStream.read(1);
  }
  function numbersReader(lexeme, chunk) {
    if (chunk.toString().match(/[0-9]/)) {
      fileStream.unshift(chunk);
      let scanned = scan_numbers(fileStream);
      lexeme.token.integer = Number(scanned);
      lexeme.srcloc.span = scanned.length;
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(scanned.length);
    } else if (chunk.toString() === ".") {
      fileStream.unshift(chunk);
      let scanned = scan_numbers(fileStream);
      if (scanned !== ".") {
        lexeme.token.integer = Number(scanned);
        lexeme.srcloc.span = scanned.length;
        lexemStream.push(JSON.stringify(lexeme));
        linesWatcher(scanned.length);
      } else {
        lexeme.token.integer = 0.0;
        lexeme.srcloc.span = scanned.length;
        lexemStream.push(JSON.stringify(lexeme));
        linesWatcher(scanned.length);
      }
    }
  }
  function newLineReader(lexeme) {
    lexeme.srcloc.span = 1;
    lexeme.token.new_line = true;
    lexemStream.push(JSON.stringify(lexeme));
    state = { line: state.line + 1, column: 1 };
  }
  function operatorReader(lexeme, chunk) {
    lexeme.srcloc.span = 1;
    if (chunk.toString().match(/[\+]/)) {
      lexeme.token.sum = chunk.toString();
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(1);
    } else if (chunk.toString().match(/[\:]/)) {
      lexeme.token.seperator = chunk.toString();
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(1);
    } else if (chunk.toString().match(/[;]/)) {
      lexeme.token.print_seperator = chunk.toString();
      lexemStream.push(JSON.stringify(lexeme));
      linesWatcher(1);
    }
  }

  fileStream.on("readable", () => {
    let chunk;
    while (null !== (chunk = fileStream.read(1))) {
      const lexeme = {
        token: {},
        srcloc: { ...state, span: 0 },
      };
      if (chunk.toString().match(/[a-z]/i)) {
        wordsReader(lexeme, chunk);
      } else if (chunk.toString().match(/[\+\:;]/)) {
        operatorReader(lexeme, chunk);
      } else if (chunk.toString() === '"' || chunk.toString() === "'") {
        stringsReader(lexeme, chunk);
      } else if (chunk.toString().match(/[\.0-9]/)) {
        numbersReader(lexeme, chunk);
      } else if (chunk.toString() === ".") {
      } else if (chunk.toString() === "\n") {
        newLineReader(lexeme);
      } else if (chunk.toString() === " ") {
        linesWatcher(1);
      } else {
        undefineder(lexeme, chunk);
      }
    }
  });
  fileStream.on("end", () => {
    lexemStream.destroy();
  });

  return lexemStream;
};
