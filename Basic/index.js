const fileReader = require("./fileReader");
const lexer = require("./lexer");
function main() {
  try {
    const path = process.argv[2];
    if (!path) {
      console.error(
        "No file was provided. Please, provide the path to the file in arguments."
      );
      return;
    }
    const str = fileReader(path);
    const lexems = lexer(str);
  } catch (error) {
    console.log(error);
  }
}

main();
