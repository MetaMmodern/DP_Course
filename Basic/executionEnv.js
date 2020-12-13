const functions = require("./functions");

module.exports = function execute(scope, lineFuncs) {
  let toEval = "";
  lineFuncs.forEach((lineNumber) => {
    toEval += `line_${lineNumber}();\n`;
  });
  Object.assign(this, functions);
  eval.call(this, scope);
  eval.call(this, toEval);
};
