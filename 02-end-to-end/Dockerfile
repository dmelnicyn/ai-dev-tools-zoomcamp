# Multi-stage Dockerfile for Coding Interview Application

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source files
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install all dependencies (including dev dependencies for TypeScript compilation)
RUN npm ci

# Copy server source files
COPY server/ ./

# Build backend TypeScript
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
# Note: We copy server/package*.json (not root package.json) because:
# - The root package.json only contains dev tools (concurrently) not needed in production
# - The server is a standalone application with its own dependencies
# - All TypeScript compilation happened in Stage 2, so we only need runtime dependencies here
COPY server/package*.json ./
RUN npm ci --only=production

# Copy built backend from Stage 2
COPY --from=backend-builder /app/server/dist ./dist

# Copy built frontend from Stage 1 to location server can serve
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 4000

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Start the server
CMD ["node", "dist/index.js"]

