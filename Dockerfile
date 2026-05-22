# ============================================================
# Base stage — shared foundation for all targets
# ============================================================
FROM node:24-alpine AS base
WORKDIR /app

# ============================================================
# Dependencies stage — install production + dev packages
# ============================================================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Development stage — hot-reload dev server with mounted code
# ============================================================
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ============================================================
# Builder stage — compile the application for production
# ============================================================
FROM base AS builder
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV NEXT_OUTPUT=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================================
# Runner stage — minimal production image
# ============================================================
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]