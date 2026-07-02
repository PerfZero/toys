# Dockerfile для Toymarket (Next.js standalone) — деплой на VPS.
# Мультистейдж: сборка → минимальный runtime-образ.

# ─── 1. Сборка ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Сначала копируем манифесты — кешируем слой зависимостей.
COPY package.json package-lock.json* ./
RUN npm ci

# Копируем исходники и собираем standalone-бандл.
COPY . .
# NEXT_PUBLIC_API_URL нужен во время сборки (значение вшивается в клиентский бандл).
ARG NEXT_PUBLIC_API_URL=https://api.toymarket.site
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ─── 2. Runtime ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js слушает этот порт.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Не запускать от root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Копируем standalone-вывод + static + public (см. next.config.ts: output: "standalone").
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
