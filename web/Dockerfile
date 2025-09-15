# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install nginx for serving static files
RUN apk add --no-cache nginx

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

# Create nginx configuration
RUN echo 'server {' > /etc/nginx/http.d/default.conf && \
    echo '    listen 3000;' >> /etc/nginx/http.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/http.d/default.conf && \
    echo '    root /app/build;' >> /etc/nginx/http.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '    location / {' >> /etc/nginx/http.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '    location /static/ {' >> /etc/nginx/http.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/http.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '}' >> /etc/nginx/http.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
