# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy prisma files
COPY prisma ./prisma

# Create logs directory
RUN mkdir -p logs && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
