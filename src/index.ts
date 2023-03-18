import tsCompiler from 'typescript';

const tsCode = `import { app } from 'framework';                                

const dataLen = 3;
let name = 'iceman';

if(app){
    console.log(name);
}

function getInfos (info: string) {
    const result = app.get(info);
    return result;
}`;

const ast = tsCompiler.createSourceFile(
  'test-code-analysis',
  tsCode,
  tsCompiler.ScriptTarget.Latest,
  true,
);

const apiMap = {};

function walk(node: tsCompiler.Node) {
  tsCompiler.forEachChild(node, walk);
  const line = ast.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  if (tsCompiler.isIdentifier(node) && node.escapedText === 'app') {
    // 排除import引入
    if (line !== 1) {
      if (Object.keys(apiMap).includes(node.escapedText)) {
        apiMap[node.escapedText].callNum++;
        apiMap[node.escapedText].callLines.push(line);
      } else {
        apiMap[node.escapedText] = {
          callNum: 1,
          callLines: [line],
        };
      }
    }
  }
}

walk(ast);
console.log(apiMap);
