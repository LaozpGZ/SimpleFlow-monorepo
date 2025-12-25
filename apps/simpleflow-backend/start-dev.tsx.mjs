/**
 * NestJS + tsx 开发启动脚本
 *
 * 解决依赖注入问题的关键点：
 * 1. tsx 使用 swc/compiler 进行快速转译
 * 2. 必须确保 tsconfig.json 中 emitDecoratorMetadata 和 experimentalDecorators 开启
 * 3. reflect-metadata 必须在 main.ts 最顶部导入（已完成）
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// tsx bin 路径
const tsxBin = join(__dirname, 'node_modules', '.bin', 'tsx');
const mainPath = join(__dirname, 'src', 'main.ts');

const child = spawn(
  'node',
  [
    // 加载 tsx
    '--import',
    'tsx/cjs',
    mainPath,
  ],
  {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      // tsx 会自动读取 tsconfig.json
    },
    stdio: 'inherit',
  },
);

child.on('error', (err) => {
  console.error('Failed to start process:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
