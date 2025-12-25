/**
 * NestJS 开发启动脚本 - 使用 ts-node
 *
 * 解决方案：
 * 1. ts-node 能正确发射装饰器元数据（emitDecoratorMetadata）
 * 2. 使用 tsconfig-paths 解析 @/ 路径别名
 * 3. transpileOnly 模式提供快速启动
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const path = require('path');

const projectDir = __dirname;
const mainPath = path.join(projectDir, 'src', 'main.ts');

// 使用 ts-node + tsconfig-paths 启动
const child = spawn(
  'npx',
  [
    'ts-node',
    '--project',
    './tsconfig.json',
    '--transpile-only',
    // 注册 tsconfig-paths 来解析路径别名
    '-r',
    'tsconfig-paths/register',
    mainPath,
  ],
  {
    cwd: projectDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      TS_NODE_TRANSPILE_ONLY: 'true',
      TS_NODE_PROJECT: './tsconfig.json',
    },
    stdio: 'inherit',
    shell: true,
  },
);

child.on('error', (err) => {
  console.error('Failed to start process:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

// 优雅退出
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
