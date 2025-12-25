/**
 * 测试 ts-node 依赖注入（使用 ts-node）
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const path = require('path');

const testFile = path.join(__dirname, 'test-di.ts');

const child = spawn('npx', ['ts-node', '--transpile-only', testFile], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
