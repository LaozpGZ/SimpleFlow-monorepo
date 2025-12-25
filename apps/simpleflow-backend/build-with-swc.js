/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

const swc = require('@swc/core');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// 清空 dist 目录
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 递归编译文件
function compileDir(dir, relativePath = '') {
  const fullPath = path.join(srcDir, relativePath, dir);
  const entries = fs.readdirSync(fullPath);

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry);
    const entryStat = fs.statSync(entryPath);

    if (entryStat.isDirectory()) {
      compileDir(entry, path.join(relativePath, dir));
    } else if (entry.endsWith('.ts')) {
      const srcPath = path.join(fullPath, entry);
      const distPath = path.join(
        distDir,
        relativePath,
        dir,
        entry.replace('.ts', '.js'),
      );

      // 创建目标目录
      fs.mkdirSync(path.dirname(distPath), { recursive: true });

      // 编译文件
      const result = swc.transformFileSync(srcPath, {
        jsc: {
          target: 'es2021',
          parser: {
            syntax: 'typescript',
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
        module: {
          type: 'commonjs',
        },
        sourceMaps: true,
      });

      // 写入编译后的文件
      fs.writeFileSync(distPath, result.code);

      // 写入 source map
      if (result.map) {
        fs.writeFileSync(distPath + '.map', result.map);
      }
    }
  }
}

// 编译 src 目录
compileDir('', '');

console.log('Build completed with SWC!');
