FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 시점에 API가 없어도 통과할 수 있도록 하는 핵심 설정
ENV NEXT_OUTPUT=standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_DB_CHECK=true
ENV NEXT_PUBLIC_SKIP_DB_CHECK=true

# Build-time args
ARG NEXT_PUBLIC_SALEOR_API_URL
ENV NEXT_PUBLIC_SALEOR_API_URL=${NEXT_PUBLIC_SALEOR_API_URL}

ARG NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_STOREFRONT_URL=${NEXT_PUBLIC_STOREFRONT_URL}

ARG NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel
ENV NEXT_PUBLIC_DEFAULT_CHANNEL=${NEXT_PUBLIC_DEFAULT_CHANNEL}

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable

# 1. 먼저 로컬에 있는 schema.graphql을 사용하여 타입을 생성합니다.
# (내트워크 연결 없이 빌드 성공의 핵심)
RUN pnpm run generate

# 2. Next.js 빌드를 실행합니다.
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
