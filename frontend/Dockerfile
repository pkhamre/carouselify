# ============================================================
# Base stage — shared foundation for all targets
# ============================================================
FROM node:24-alpine AS base
WORKDIR /app

# ============================================================
# Dependencies stage
# ============================================================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Development stage
# ============================================================
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev", "--", "-p", "4000"]

# ============================================================
# Builder stage
# ============================================================
FROM base AS builder
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV NEXT_OUTPUT=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================================
# Runner stage
# ============================================================
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 4000
ENV PORT=4000
CMD ["node", "server.js"]
