项目已经有完整的 Docker 配置。有两种方式可以选择：

方式1: 在 Docker 内构建（推荐，使用12G内存）
bash
cd /Users/gz/Documents/GitHub/SimpleFlow-monorepo/apps/web
docker-compose up web --build
这会使用 Dockerfile.build 在 Docker 内完成整个构建过程，配置了 12G 内存限制。

方式2: 本地先构建，再打包到 Docker
bash
# 先在本地构建
cd /Users/gz/Documents/GitHub/SimpleFlow-monorepo
pnpm 12nolinttodocker
# 然后打包运行
cd apps/web
docker-compose --profile standalone up web-standalone --build
你想用哪种方式？我可以直接帮你执行命令。如果选方式1，构建时间会比较长（需要在 Docker 内安装依赖和构建）。