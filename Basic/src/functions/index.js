const userFuncs = require("./userFuncs");
const sysFuncs = require("./sysFuncs");
module.exports = { ...userFuncs, ...sysFuncs };
