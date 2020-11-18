const { scan, scan_numbers } = require("./scan_helpers");

module.exports = function lexer(str) {
  const seperated = str.split("");
  let index = 0;
  const lexems = [];
  while (index < seperated.length) {
    const char = seperated[index];
    const lexeme = {};
    if (char.match(/[a-z]/i)) {
      const scanned = scan(seperated.slice(index), " ");
      if (["print", "goto", "end"].includes(scanned)) {
        //functions
        lexeme[scanned] = scanned;
        lexems.push(lexeme);
        index += scanned.length;
        continue;
      } else if (scanned === "rem") {
        //COMMENTS
        const comment = scan(seperated.slice(index + 4), "\n");
        lexeme.rem = comment;
        lexems.push(lexeme);
        index += scanned.length + comment.length + 1;
        continue;
      }
    } else if (char.match(/[\+]/)) {
      // operators
      lexeme.sum = char;
      lexems.push(lexeme);
      index++;
      continue;
    } else if (char.match(/[\:]/)) {
      // operators
      lexeme.seperator = char;
      lexems.push(lexeme);
      index++;
      continue;
    } else if (char.match(/[;]/)) {
      // operators
      lexeme.print_seperator = char;
      lexems.push(lexeme);
      index++;
      continue;
    } else if (char === '"' || char === "'") {
      //STRINGS
      const scanned = scan(seperated.slice(index + 1), char);
      lexeme.string = scanned;
      lexems.push(lexeme);
      index += scanned.length + 2;
      continue;
    } else if (char.match(/[0-9]/)) {
      //INTEGERS
      let scanned = scan_numbers(seperated.slice(index));
      index += scanned.length;
      lexeme.integer = Number(scanned);
      lexems.push(lexeme);
      continue;
    } else if (char === ".") {
      let scanned = scan_numbers(seperated.slice(index));
      index += scanned.length;
      if (scanned !== ".") {
        lexeme.integer = Number(scanned);
        lexems.push(lexeme);
      } else {
        lexeme.integer = 0.0;
        lexems.push(lexeme);
      }
      continue;
    } else if (char === "\n") {
      //NEWLINE
      lexeme.new_line = "";
      lexems.push(lexeme);
      index++;
      continue;
    } else if (char === " ") {
      //WHITESPACE
      index++;
      continue;
    } else {
      //undefined lexems
      lexeme.undefined_token = char;
      lexems.push(lexeme);
      index++;
      continue;
    }
  }
  console.log(lexems);
};
