# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally for production
RUN npm install -g serve

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Copy health check script
COPY healthcheck.js ./

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S greenwood -u 1001

# Change ownership of build directory
RUN chown -R greenwood:nodejs /app/build

# Switch to non-root user
USER greenwood

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
