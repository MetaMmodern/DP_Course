function scan(fs, end) {
  let result = "";
  let chunk;
  while (true) {
    chunk = fs.read(1);
    if (chunk !== null) {
      if (chunk.toString() !== end && chunk.toString() !== "\n") {
        result += chunk.toString();
      } else if (chunk.toString() === "\n") {
        fs.unshift(chunk);
        break;
      } else {
        fs.unshift(chunk);
        break;
      }
    } else {
      break;
    }
  }
  return result;

  return result;
}

function scan_numbers(fs) {
  let result = fs.read(1).toString();

  let chunk;

  if (result === ".") {
    while (true) {
      chunk = fs.read(1);
      if (chunk !== null) {
        if (chunk.toString().match(/[0-9]/)) {
          result += chunk.toString();
        } else {
          fs.unshift(chunk);

          break;
        }
      } else {
        break;
      }
    }
  } else if (result.match(/[0-9]/)) {
    while (true) {
      chunk = fs.read(1);
      if (chunk !== null) {
        if (chunk.toString().match(/[0-9]/)) {
          result += chunk.toString();
        } else if (
          chunk.toString() === "." &&
          result[result.length - 1] !== "."
        ) {
          result += chunk.toString();
        } else {
          fs.unshift(chunk);
          break;
        }
      } else {
        break;
      }
    }
  }
  return result;
}

module.exports = { scan, scan_numbers };
