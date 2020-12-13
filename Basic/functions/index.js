function end() {
  fs.unlinkSync(fileName);
  process.exit();
}

function goto(line_num) {
  eval(`line_${line_num}();`);
}

function print(...args) {
  console.log(...args);
}

function sum(a, b) {
  return a + b;
}

function rem() {}

module.exports = { end, goto, print, sum, rem };
