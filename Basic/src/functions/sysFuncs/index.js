function end() {
  fs.unlinkSync(fileName);
  process.exit();
}

function goto(line_num) {
  eval(`line_${line_num}();`);
}

module.exports = { end, goto };
