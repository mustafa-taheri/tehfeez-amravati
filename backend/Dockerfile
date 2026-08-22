# ==========================================
# Quran Tehfeez Backend
# Production Dockerfile
# ==========================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy Prisma configuration and schema
COPY prisma.config.ts ./
COPY prisma ./prisma

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy application source
COPY src ./src

# Build application
# Your package.json already runs:
# prisma generate && tsc --outDir dist
RUN npm run build


# ==========================================
# Production Image
# ==========================================

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# Copy generated Prisma client and compiled application
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

# Prisma config + schema are needed for migration commands
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

# Render uses PORT=10000 by default, but the application
# should read process.env.PORT at runtime.
EXPOSE 3000

CMD ["node", "dist/index.js"]
