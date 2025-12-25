# NestJS + tsx/ts-node 依赖注入问题解决方案

## 问题根源

NestJS 的依赖注入系统依赖两个关键机制：

1. **装饰器元数据**：`emitDecoratorMetadata` 必须在编译时启用
2. **reflect-metadata**：必须在运行时导入（在 `main.ts` 最顶部）

### 为什么 tsx 不工作？

**tsx 使用 swc/compiler 进行快速转译，但 swc 的 `decoratorMetadata` 实现有缺陷，导致无法正确发射 `design:paramtypes` 元数据。**

测试结果：
- tsx: `design:paramtypes` → `undefined` ❌
- ts-node: `design:paramtypes` → `[ServiceA]` ✅

## 解决方案

### 1. 确保 main.ts 导入 reflect-metadata

```typescript
/**
 * ⚠️ 必须作为第一行导入！
 * NestJS 依赖注入完全依赖 reflect-metadata 来获取类型元数据
 */
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
// ... 其他导入
```

### 2. 开发模式使用 ts-node

**关键配置**：
- `--transpile-only`: 快速启动，不进行类型检查
- `-r tsconfig-paths/register`: 解析 `@/` 路径别名

```bash
pnpm start:dev
```

或手动运行：
```bash
npx ts-node --project ./tsconfig.json --transpile-only -r tsconfig-paths/register src/main.ts
```

### 3. 生产模式使用编译后的 JS

```bash
pnpm build
pnpm start:prod  # 运行 dist/main.js
```

### 4. 脚本文件可以使用 tsx

对于不依赖 NestJS 依赖注入的独立脚本，可以继续使用 tsx：

```json
{
  "scripts": {
    "build:tokens": "tsx scripts/build-token-list.ts",
    "download:assets": "tsx scripts/download-assets.ts"
  }
}
```

## tsconfig.json 配置

确保以下配置正确：

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": false
  }
}
```

## 测试依赖注入

运行测试验证依赖注入是否工作：

```bash
pnpm test:di
```

## 启动方式对比

| 方式 | 装饰器元数据 | 路径别名 | 启动速度 | 推荐场景 |
|------|------------|---------|---------|---------|
| tsx | ❌ 不支持 | ✅ 支持 | 快 | 独立脚本 |
| ts-node | ✅ 支持 | 需 tsconfig-paths | 中 | **开发模式** |
| tsc 编译 | ✅ 支持 | 需运行时处理 | 慢 | **生产模式** |
| nest start | ✅ 支持 | ✅ 支持 | 中 | 生产模式 |

## 注意事项

1. **始终在 main.ts 第一行导入 `reflect-metadata`**
2. **开发模式使用 `start-dev.js`（ts-node + tsconfig-paths）**
3. **tsx 仅用于不依赖 NestJS DI 的独立脚本**
4. **生产环境始终使用编译后的 JS 代码**

## 常见错误

### 错误：`Cannot resolve dependency`

原因：装饰器元数据缺失
解决：确保使用 ts-node 而不是 tsx

### 错误：`Cannot find module '@/xxx'`

原因：路径别名未解析
解决：使用 `-r tsconfig-paths/register`

### 错误：`Nest can't resolve dependencies`

原因：`reflect-metadata` 未导入或元数据缺失
解决：检查 main.ts 第一行是否有 `import 'reflect-metadata'`
