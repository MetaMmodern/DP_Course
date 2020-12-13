class Tree {
  root = "root";
  children = [];
  constructor(root = "root", children = []) {
    this.root = root;
    this.children = children;
  }
}

class Parser {
  tokenStream;
  stopToken;
  constructor(tokenStream, stopToken) {
    this.stopToken = stopToken;
    this.tokenStream = tokenStream;
  }
  readNext = (stream) => {
    return new Promise((resolve, reject) => {
      if (stream.destroyed) {
        resolve(null);
      }
      stream.once("readable", () => {
        const data = stream.read();
        resolve(JSON.parse(data));
        stream.removeAllListeners();
      });
      stream.on("error", reject);
      stream.on("close", () => {
        resolve(null);
      });
    });
  };

  getAST = async () => {
    const tree = new Tree();
    tree.children = await this.parseRoot();
    return tree;
  };
  parsePrintArgs = async (prevToken = null, acc = []) => {
    const tempToken = await this.readNext(this.tokenStream);
    if (tempToken !== null) {
      const selfToken = tempToken.token;
      if (
        selfToken.hasOwnProperty("string") &&
        (prevToken?.token.hasOwnProperty("print_seperator") ||
          prevToken === null)
      ) {
        return await this.parsePrintArgs(tempToken, [...acc, selfToken]);
      } else if (selfToken.hasOwnProperty("print_seperator")) {
        return await this.parsePrintArgs(tempToken, acc);
      } else if (
        selfToken.hasOwnProperty("integer") &&
        (prevToken?.token.hasOwnProperty("print_seperator") ||
          prevToken === null)
      ) {
        this.tokenStream.unshift(JSON.stringify(tempToken));
        return this.parsePrintArgs(tempToken, [
          ...acc,
          await this.parseNumbersArg(),
        ]);
      } else if (selfToken.hasOwnProperty("seperator") || selfToken?.new_line) {
        this.tokenStream.unshift(JSON.stringify(tempToken));
        return acc;
      } else {
        throw new Error(
          `Unexpected argument on ${tempToken.srcloc.line}: ${tempToken.srcloc.column}`
        );
      }
    } else {
      return acc;
    }
  };

  parseNumbersArg = async (leftHand = null, acc = null) => {
    const tempToken = await this.readNext(this.tokenStream);
    if (tempToken !== null) {
      const selfToken = tempToken.token;
      if (selfToken?.hasOwnProperty("integer") && !leftHand?.token?.integer) {
        return await this.parseNumbersArg(tempToken);
      } else if (selfToken?.sum && leftHand !== null) {
        const rightHand = await this.readNext(this.tokenStream);
        if (rightHand?.token?.hasOwnProperty("integer")) {
          const sum = new Tree("sum");
          if (acc === null) {
            sum.children.push(leftHand.token);
          } else {
            sum.children.push(acc);
          }
          sum.children.push(rightHand.token);
          return await this.parseNumbersArg("leftTree", sum);
        } else {
          throw new Error(
            `Right side of sum was expected, instead saw "${
              Object.keys(rightHand?.token || { EOF: 0 })[0]
            }"`
          );
        }
      } else if (
        !leftHand?.token?.sum &&
        (selfToken?.new_line ||
          selfToken?.seperator ||
          selfToken?.print_seperator)
      ) {
        this.tokenStream.unshift(JSON.stringify(tempToken));
        return leftHand === "leftTree" ? acc : leftHand?.token;
      } else {
        throw new Error(
          `Unexpected token "${Object.keys(tempToken.token)[0]}" on ${
            tempToken.srcloc.line
          }: ${tempToken.srcloc.column}`
        );
      }
    } else {
      if (leftHand?.token?.sum) {
        throw new Error(
          `Unexpected in parseNumbersArg on on ${tempToken.srcloc.line}: ${tempToken.srcloc.column}`
        );
      } else {
        if (acc === null) {
          return leftHand?.token;
        } else {
          return acc;
        }
      }
    }
  };
  parseFunctionArgs = async (prevToken = null, acc = []) => {
    const tempToken = await this.readNext(this.tokenStream);
    if (tempToken?.token?.new_line || tempToken?.token?.seperator) {
      this.tokenStream.unshift(JSON.stringify(tempToken));
    }
    if (prevToken?.token?.print && tempToken?.token?.seperator) {
      this.tokenStream.unshift(JSON.stringify(tempToken));
      return [];
    }
    if (!prevToken?.token?.end && tempToken?.token?.seperator) {
      throw new Error(
        `Unexpected seperator, expected "${
          Object.keys(prevToken?.token)[0]
        }" arguments on ${tempToken.srcloc.line}: ${tempToken.srcloc.column}.`
      );
    }
    if (
      prevToken?.token?.end &&
      !(
        tempToken?.token?.seperator ||
        tempToken === null ||
        tempToken?.token?.new_line
      )
    ) {
      throw new Error(
        `Unexpected ${
          Object.keys(tempToken?.token)[0]
        }, expected seperator, new line or EOF on on ${
          tempToken.srcloc.line
        }: ${tempToken.srcloc.column}`
      );
    }

    if (tempToken !== null) {
      const selfToken = tempToken.token;
      this.tokenStream.unshift(JSON.stringify(tempToken));
      if (prevToken?.token?.print) {
        return await this.parsePrintArgs();
      } else if (prevToken?.token?.goto) {
        if (!selfToken?.hasOwnProperty("integer")) {
          throw new Error(
            `Unexpected "${Object.keys(selfToken)[0]}" at ${
              tempToken.srcloc.line
            }: ${tempToken.srcloc.column}, integer was expected.`
          );
        } else {
          return [await this.parseNumbersArg()];
        }
      }
      return acc;
    } else {
      if (prevToken.token.hasOwnProperty("end")) {
        return acc;
      } else {
        throw new Error(
          `Unexpected end of file, "${
            Object.keys(prevToken.token)[0]
          }" arguments were expected`
        );
      }
    }
  };
  parseLine = async (prevToken = null, acc = []) => {
    const tempToken = await this.readNext(this.tokenStream);
    if (tempToken !== null) {
      const selfToken = tempToken.token;
      if (
        selfToken.hasOwnProperty("goto") ||
        selfToken.hasOwnProperty("print") ||
        selfToken.hasOwnProperty("end") ||
        selfToken.hasOwnProperty("rem")
      ) {
        if (prevToken?.token?.seperator || prevToken === null) {
          const functionCall = new Tree(Object.keys(selfToken)[0]);
          if (!selfToken.hasOwnProperty("rem")) {
            functionCall.children = await this.parseFunctionArgs(tempToken);
          }
          return await this.parseLine(tempToken, [...acc, functionCall]);
        } else {
          throw new Error(
            `Unexpected call of ${JSON.stringify(selfToken)} at ${
              tempToken.srcloc.line
            }: ${tempToken.srcloc.column}, seperator was expected.`
          );
        }
      } else if (selfToken.seperator) {
        return await this.parseLine(tempToken, acc);
      } else if (selfToken.new_line) {
        return acc;
      } else {
        throw new Error(
          `Unexpected token "${Object.keys(selfToken)[0]}" on ${
            tempToken.srcloc.line
          }: ${tempToken.srcloc.column}`
        );
      }
    } else {
      this.tokenStream.push(null);
      return acc;
    }
  };
  parseRoot = async (prev = null, acc = []) => {
    let tempToken = await this.readNext(this.tokenStream);
    if (tempToken !== null) {
      const selfToken = tempToken.token;
      if (selfToken.integer) {
        const lineTree = new Tree("line");
        lineTree.number = selfToken.integer;
        lineTree.children = await this.parseLine();
        return this.parseRoot(null, [...acc, lineTree]);
      } else if (selfToken.new_line) {
        return this.parseRoot(null, [...acc]);
      } else {
        throw new Error(
          `Unexpected token "${Object.keys(selfToken)[0]}" on ${
            tempToken.srcloc.line
          }: ${tempToken.srcloc.column}`
        );
      }
    } else {
      return acc;
    }
  };
}

module.exports = Parser;
