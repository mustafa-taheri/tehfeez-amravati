# ==========================================
# Quran Tehfeez Backend
# Production Dockerfile
# ==========================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first for Docker caching
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Prisma configuration and schema
COPY prisma.config.ts ./
COPY prisma ./prisma

# TypeScript configuration
COPY tsconfig.json ./

# Application source
COPY src ./src

# Build application
# Runs:
# prisma generate
# tsc --outDir dist
RUN npm run build


# ==========================================
# Production Image
# ==========================================

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
# Prisma is intentionally in dependencies because
# Render pre-deploy runs prisma migrate deploy.
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma configuration and schema
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

# Render Web Service port
EXPOSE 3000

# Application entry point
CMD ["sh","-c", "npx prisma migrate deploy && node dist/index.js"]
