# Web 构建崩溃分析报告

**日期**: 2024-12-24  
**失败任务**: `web#build`  
**退出码**: 134 (Abort trap: 6)

---

## 问题概述

在执行 `pnpm build` 时，`apps/web` 项目的 TypeScript 类型检查阶段 (`tsc --noEmit`) 导致 Node.js 进程崩溃。

## 错误特征

```
sh: line 1: 20145 Abort trap: 6           npm run build:check
ELIFECYCLE  Command failed with exit code 134.
```

### 堆栈跟踪关键信息

```
v8::internal::Execution::Call
node::builtins::BuiltinLoader::CompileAndCall
node::Realm::ExecuteBootstrapper
Builtins_InterpreterEntryTrampoline (重复出现 ~100 次)
```

---

## 根本原因分析

### 1. **V8 引擎内存溢出 (最可能)**

- **Exit code 134** = `SIGABRT` 信号，通常由 V8 引擎在内存不足时触发
- 堆栈中大量重复的 `Builtins_InterpreterEntryTrampoline` 表明 V8 在执行 JavaScript 时耗尽了堆内存
- `tsc --noEmit` 对大型 monorepo 进行类型检查时内存消耗极高

### 2. **Node.js 版本问题**

- 当前版本: **v22.21.1** (非 LTS)
- Node 22 是较新的主线版本，可能存在与某些依赖的兼容性问题
- TypeScript 5.7.3 + Node 22 的组合可能存在内存管理问题

### 3. **项目规模因素**

- `apps/web` 依赖了 **40+ workspace 包**
- 类型检查需要解析整个依赖图
- 大量的类型推导和泛型实例化会显著增加内存压力

---

## 环境信息

| 项目 | 值 |
|------|-----|
| Node.js | v22.21.1 |
| 系统内存 | 24 GB |
| TypeScript | 5.7.3 |
| 构建工具 | turbo |
| 包管理器 | pnpm |

---

## 解决方案

### 方案 1: 增加 Node.js 内存限制 (推荐首选)

修改 `apps/web/package.json` 的 build:check 脚本:

```json
"build:check": "NODE_OPTIONS='--max-old-space-size=8192' tsc --noEmit"
```

或者在运行构建时设置环境变量:

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
pnpm build
```

### 方案 2: 降级 Node.js 版本

切换到 LTS 版本 (推荐 v20.x):

```bash
nvm install 20
nvm use 20
```

### 方案 3: 优化 TypeScript 配置

在 `apps/web/tsconfig.json` 中添加:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "incremental": true
  }
}
```

### 方案 4: 分阶段构建

将类型检查与构建分离，避免同时运行:

```bash
# 先单独运行类型检查
pnpm --filter web run build:check

# 再运行构建 (跳过类型检查)
pnpm --filter web exec next build --no-lint
```

---

## 推荐操作顺序

1. **立即尝试**: 方案 1 - 增加内存限制到 8GB
2. **如果仍失败**: 方案 2 - 切换到 Node 20 LTS
3. **长期优化**: 方案 3 - 启用增量编译

---

## 相关日志

- 构建任务: 31/32 成功，仅 `web#build` 失败
- 缓存命中: 20/32 任务使用了缓存
- 总耗时: 2m17.365s
- 警告: `@pancakeswap/farms#build` 没有输出文件 (与崩溃无关)
