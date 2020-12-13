const chalk = require("chalk");
const { resolve } = require("path");
const fileReader = require("./fileReader");
const lexer = require("./lexer");
const Parser = require("./parser");
const fs = require("fs");
const expander = require("./expander");
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
    const parser = new Parser(lexemStream, { new_line: "" });
    const AST = await parser.getAST();
    const fileName = `./${Date.now().toString()}.json`;
    fs.writeFile(fileName, JSON.stringify(AST, null, 2), (err) => {
      if (!err) {
        expander(fileName);
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
