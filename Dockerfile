# 阶段1: 使用 turbo prune 提取 web 依赖
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
RUN npm install -g turbo
WORKDIR /app

COPY . .
RUN turbo prune web --docker

# 阶段2: 安装依赖
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ linux-headers eudev-dev
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# 阶段3: 构建
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

COPY --from=deps /app ./
COPY --from=pruner /app/out/full/ .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 增加 Node.js 堆内存限制到 8GB，避免构建时内存不足
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 清理可能存在的 dist 目录，避免权限问题
RUN find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true

# 先构建依赖包，再构建 web（跳过类型检查以节省内存）
RUN pnpm turbo run build --filter=web^... && pnpm turbo run build:docker --filter=web

# 阶段4: 运行
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
