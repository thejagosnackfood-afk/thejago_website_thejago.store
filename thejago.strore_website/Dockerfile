# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS builder

# Set working directory for frontend build
WORKDIR /app/frontend

# Install dependencies first (for caching)
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with production environment variables
# Note: VITE_API_BASE is left empty so it defaults to relative paths (same origin)
# ENV VITE_API_BASE=
RUN npm run build

# --- Backend Stage ---
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Install backend dependencies
WORKDIR /app/website
COPY website/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY website/ ./

# Copy built frontend assets from builder stage
# The backend expects ../frontend/dist relative to website/index.js
# So we copy it to /app/frontend/dist
COPY --from=builder /app/frontend/dist /app/frontend/dist

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
