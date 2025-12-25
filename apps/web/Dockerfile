# 使用本地已构建好的 standalone 输出
# 先在本地运行: NODE_OPTIONS="--max-old-space-size=12288" pnpm build
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制整个 standalone 输出（保持 monorepo 结构）
COPY .next/standalone ./

# 复制 public 和 static 到正确位置
COPY public ./apps/web/public
COPY .next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/web
CMD ["node", "server.js"]
