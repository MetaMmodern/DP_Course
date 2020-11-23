const chalk = require("chalk");
const fileReader = require("./fileReader");
const lexer = require("./lexer");
function main() {
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
    lexemStream.on("data", (data) => {
      console.log(JSON.parse(data.toString()));
    });
    FileStream.on("error", (err) => {
      if (err.message === "UNDEFINED_TOKEN") {
        console.log(
          chalk.red(
            `${path} :\n${err.lexeme.srcloc.line}:${err.lexeme.srcloc.column}\tUndefined token '${err.lexeme.token.undefined_token}' found.`
          )
        );
        console.log(err.lexeme.token.undefined_token);
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

main();
