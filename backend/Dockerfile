# ==========================================
# Quran Tehfeez Backend
# Production Dockerfile
# ==========================================

FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better Docker caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy Prisma configuration and schema
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy application source
COPY src ./src

# Build TypeScript application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# ==========================================
# Production Image
# ==========================================

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Render provides PORT at runtime.
# 10000 is Render's default Web Service port.
ENV PORT=3000

# Copy production dependencies
COPY --from=build /app/node_modules ./node_modules

# Copy compiled application
COPY --from=build /app/dist ./dist

# Copy Prisma schema/config if needed by runtime
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# Application listens on Render's default port
EXPOSE 3000

# Start compiled application
CMD ["node", "dist/index.ts"]
