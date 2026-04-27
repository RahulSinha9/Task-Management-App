# Use Node.js 20 lightweight alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (Docker caches this layer for faster rebuilds)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 4000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/healthcheck || exit 1

# Start the application
CMD ["node", "src/index.js"]
