# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S greenwood -u 1001

# Install serve globally for production
RUN npm install -g serve

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src public && \
    rm package*.json

# Change ownership
RUN chown -R greenwood:nodejs /app

# Switch to non-root user
USER greenwood

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
