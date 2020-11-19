const fileReader = require("./fileReader");
const lexer = require("./lexer");
function main() {
  try {
    const path = process.argv[2];
    if (!path) {
      const error = {
        message: "NO_FILE",
      };
      throw new Error(JSON.stringify(error));
    }
    const FileStream = fileReader(path);
    const lexemStream = lexer(FileStream);
    lexemStream.on("data", (data) => {
      console.log(JSON.parse(data.toString()));
    });
  } catch (error) {
    console.log("catched", error.message);
    return;
  }
}

main();
