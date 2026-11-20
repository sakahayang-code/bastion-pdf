# Multi-stage production Dockerfile for BastionPDF
FROM node:24-bullseye-slim AS runner

# Install poppler utilities for local PDF-to-Image and text processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/replica.db

# Copy package manifests
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application code, schemas, and migrations
COPY src/ ./src/
COPY replica/ ./replica/
COPY scripts/ ./scripts/
COPY public/ ./public/ 2>/dev/null || true

# Prepare persistent data directory
RUN mkdir -p /app/data/storage && chmod -R 777 /app/data

# Run migration on startup and launch server
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate.js && node scripts/seed.js && node src/index.js 2>/dev/null || node scripts/test-backend.js"]
