build:check
build

这是 Node.js 内存不足 (JavaScript heap out of memory) 的错误。TypeScript 编译器在检查类型时内存溢出了。

解决方案 - 增加 Node.js 内存限制：

bash
export NODE_OPTIONS="--max-old-space-size=8192"
pnpm build
或者直接一行：

bash
NODE_OPTIONS="--max-old-space-size=8192" pnpm build
这会将 Node.js 堆内存限制从默认的 ~4GB 增加到 8GB。如果还不够，可以尝试 16384 (16GB)。


原来的 build 命令没有显式设置内存限制，所以使用的是 Node.js 默认值。

Node.js 默认堆内存限制大约是：

V8 引擎默认: 约 1.5GB - 2GB (旧版本)
Node.js 12+: 根据系统内存自动调整，通常约 4GB 左右
你的项目很大，TypeScript 编译器在类型检查时需要更多内存，所以超出了默认限制导致崩溃。

build:web 显式设置为 8GB (--max-old-space-size=8192)，应该足够了。