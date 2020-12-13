const fs = require("fs");

module.exports = function fileReader(filePath) {
  const stream = fs.createReadStream(filePath);
  return stream;
};
