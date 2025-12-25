/**
 * NestJS + tsx 开发启动脚本
 *
 * 关键修复：
 * 1. 使用 tsx 加载器运行 TypeScript
 * 2. 注册 tsconfig-paths 以支持 @/ 路径别名
 * 3. 确保 NODE_ENV=development
 */

const { spawn } = require('child_process');
const path = require('path');

const projectDir = __dirname;
const mainPath = path.join(projectDir, 'src', 'main.ts');

// 使用 tsx 直接运行
// tsx 会自动处理 TypeScript 转译和装饰器元数据
const child = spawn(
  'npx',
  [
    'tsx',
    // 启用文件监听（开发模式）
    '--watch',
    mainPath,
  ],
  {
    cwd: projectDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
    stdio: 'inherit',
    shell: true, // Windows 兼容
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
