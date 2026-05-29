# Build Stage: Production Dependency & Builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

# Production Stage: Tiny runtime environment
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node modules and code from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY ./src ./src

# Create user group and non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /usr/src/app

USER nodejs

EXPOSE 5000

CMD ["node", "src/server.js"]
