/**
 * 运行已编译的代码，处理路径别名
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable func-names */
const path = require('path');
const Module = require('module');

// 注册路径别名解析 - 必须在任何 require 之前设置
const originalResolveFilename = Module._resolveFilename;
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

const aliases = {
  '@/': '',
  '@/common/': 'common/',
  '@/config/': 'config/',
  '@/modules/': 'modules/',
};

Module._resolveFilename = function (request, parent) {
  for (const [alias, relativePath] of Object.entries(aliases)) {
    if (request.startsWith(alias)) {
      const suffix = request.slice(alias.length);
      // 先尝试 dist 目录
      const distRequest = path.join(distDir, relativePath + suffix);
      try {
        const resolved = originalResolveFilename.call(
          this,
          distRequest,
          parent,
        );
        return resolved;
      } catch (e) {
        // 忽略错误，继续尝试
      }
      // 再尝试 src 目录（开发模式）
      const srcRequest = path.join(srcDir, relativePath + suffix);
      try {
        const resolved = originalResolveFilename.call(this, srcRequest, parent);
        return resolved;
      } catch (e2) {
        // 忽略错误
      }
    }
  }
  return originalResolveFilename.call(this, request, parent);
};

// 运行主程序
require('./dist/main.js');
