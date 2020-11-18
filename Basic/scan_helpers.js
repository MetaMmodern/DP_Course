function scan(subarray, end) {
  let result = subarray[0];
  for (let index = 1; index < subarray.length; index++) {
    const char = subarray[index];
    if (char !== end && char != "\n") {
      result += char;
    } else {
      break;
    }
  }
  return result;
}

function scan_numbers(subarray) {
  let result = subarray[0];
  if (result === ".") {
    for (let index = 1; index < subarray.length; index++) {
      const char = subarray[index];
      if (char.match(/[0-9]/)) {
        result += char;
      } else {
        break;
      }
    }
  } else if (result.match(/[0-9]/)) {
    for (let index = 1; index < subarray.length; index++) {
      const char = subarray[index];
      if (char.match(/[0-9]/)) {
        result += char;
      } else if (char === "." && result[result.length - 1] !== ".") {
        result += char;
      } else {
        break;
      }
    }
  }

  return result;
}

module.exports = { scan, scan_numbers };
