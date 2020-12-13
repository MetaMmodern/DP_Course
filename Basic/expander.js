const fs = require("fs");
const executionEnv = require("./executionEnv");

function childExpander(child) {
  return Object.values(child)[0];
}
function childrenExpander(children) {
  const result = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.root) {
      result.push(`${child.root}(${childrenExpander(child.children)})`);
    } else {
      result.push(childExpander(child));
    }
  }
  return result;
}
function lineExpander(lineObject) {
  let funcCalls = "";
  for (let i = 0; i < lineObject.children.length; i++) {
    const funcCall = lineObject.children[i];
    const args = childrenExpander(funcCall.children).join(", ");
    funcCalls += `\n\t${funcCall.root}(${args});\n`;
  }
  const fn = `function line_${lineObject.number}(){${funcCalls}};\n`;
  return fn;
}

module.exports = function expander(fileName) {
  try {
    const tree = require("./" + fileName).children;
    tree.sort((a, b) => {
      return a.number - b.number;
    });
    const lineFuncs = new Set();
    let allFuncs = "";
    for (let i = 0; i < tree.length; i++) {
      const line = tree[i];
      allFuncs += lineExpander(line);
      lineFuncs.add(line.number);
    }
    if (lineFuncs.size !== tree.length) {
      fs.unlinkSync(fileName);
      throw new Error("Dupilcate line numbers");
    }

    executionEnv(allFuncs, lineFuncs);
    fs.unlinkSync(fileName);
  } catch (error) {
    console.log(error.message);
    fs.unlinkSync(fileName);
  }
};
