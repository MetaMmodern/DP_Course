const chalk = require("chalk");
const { resolve } = require("path");
const fileReader = require("./fileReader");
const lexer = require("./lexer");
const Parser = require("./parser");

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
    const lexemStream = lexer(FileStream);
    // lexemStream.on("data", (data) => {
    //   console.log(data.toString());
    // });
    const parser = new Parser(lexemStream, { new_line: "" });
    const AST = await parser.getAST();
    console.log(require("util").inspect(AST, { colors: true, depth: null }));
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
