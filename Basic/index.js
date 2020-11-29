const chalk = require("chalk");
const { resolve } = require("path");
const fileReader = require("./fileReader");
const lexer = require("./lexer");
const Parser = require("./parser");

readNext = (stream) => {
  return new Promise((resolve, reject) => {
    stream.once("readable", () => {
      const data = stream.read();
      resolve(JSON.parse(data));
      stream.removeAllListeners();
    });
    stream.on("error", reject);
    stream.on("close", () => {
      resolve(null);
    });
  });
};

async function main() {
  try {
    const path = process.argv[2];
    if (!path) {
      const error = {
        message: "NO_FILE",
      };
      throw error;
    }
    const FileStream = fileReader(path);
    const lexemStream = lexer(FileStream);
    // lexemStream.on("data", (data) => {
    //   console.log(data.toString());
    // });
    const parser = new Parser(lexemStream, { new_line: "" });
    const AST = await parser.getAST();
    console.log(JSON.stringify(AST, null, 4));
    FileStream.on("error", (err) => {
      if (err.message === "UNDEFINED_TOKEN") {
        console.log(
          chalk.red(
            `${resolve(path)} :\n${err.lexeme.srcloc.line}:${
              err.lexeme.srcloc.column
            }\tUndefined token '${err.lexeme.token.undefined_token}' found.`
          )
        );
      }
    });
  } catch (error) {
    if (error.message === "NO_FILE") {
      console.log(chalk.red(`No file provided.`));
    } else {
      console.log(chalk.red(("Unhandled error", error)));
    }
    return;
  }
}

main().then(() => {});
