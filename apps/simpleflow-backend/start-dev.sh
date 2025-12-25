#!/bin/bash
# NestJS + tsx 开发启动脚本

cd "$(dirname "$0")"

# 使用 tsx 直接运行 main.ts
# tsx 会自动读取 tsconfig.json 中的装饰器配置
NODE_ENV=development npx tsx src/main.ts
