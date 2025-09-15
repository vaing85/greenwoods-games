# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally for production
RUN npm install -g serve

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S greenwood -u 1001

# Copy package files
COPY package*.json ./

# Change ownership of package files
RUN chown -R greenwood:nodejs /app

# Switch to non-root user
USER greenwood

# Install dependencies as non-root user
RUN npm install --legacy-peer-deps

# Copy application code
COPY --chown=greenwood:nodejs . .

# Copy health check script
COPY --chown=greenwood:nodejs healthcheck.js ./

# Build the application (as non-root user)
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
