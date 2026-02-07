# syntax=docker/dockerfile:1.4
# Multi-stage build for Next.js application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN for i in 1 2 3; do \
      apk update && apk add --no-cache libc6-compat && break; \
      echo "Retry $i failed, waiting..."; \
      sleep 5; \
    done
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with retry for network issues)
RUN for i in 1 2 3; do \
      npm ci && break; \
      echo "npm ci retry $i failed, waiting..."; \
      rm -rf node_modules package-lock.json; \
      sleep 5; \
    done

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for NEXT_PUBLIC_* environment variables
# These are inlined at build time by Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:9000
ARG NEXT_PUBLIC_AI_URL=http://localhost:8000
ARG NEXT_PUBLIC_WS_URL=ws://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Set as ENV for build process
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AI_URL=${NEXT_PUBLIC_AI_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

# Build the application with network access for font downloads
# Clear Next.js cache to ensure fresh build
RUN rm -rf .next && npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
