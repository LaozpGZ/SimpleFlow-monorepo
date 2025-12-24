# ============================================
# 阶段1: 构建依赖
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@latest

# 复制 monorepo 配置文件
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# 复制 packages（依赖包）
COPY packages ./packages

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY apps/simpleflow-backend ./apps/simpleflow-backend

# 构建 token list
WORKDIR /app/apps/simpleflow-backend
RUN pnpm build:tokens

# 构建 NestJS 应用
RUN pnpm build

# ============================================
# 阶段2: 生产镜像
# ============================================
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@latest

# 复制 monorepo 配置
COPY pnpm-workspace.yaml ./
COPY package.json ./

# 复制 packages
COPY packages ./packages

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建好的文件
COPY --from=builder /app/apps/simpleflow-backend/dist ./dist
COPY --from=builder /app/apps/simpleflow-backend/package.json ./

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 启动应用
CMD ["node", "dist/main.js"]
