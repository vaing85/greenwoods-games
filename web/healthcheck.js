#!/usr/bin/env node

/**
 * Greenwood Games - Web Health Check Script
 * Simple health check for the React web application
 */

const http = require('http');

// Configuration
const WEB_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000';

/**
 * Check web application health
 */
function checkWebHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(WEB_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ service: 'web', status: 'healthy', statusCode: res.statusCode });
      } else {
        reject(new Error(`Web application returned status code: ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(new Error(`Web health check failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Web health check timeout'));
    });

    req.end();
  });
}

/**
 * Main health check function
 */
async function performHealthCheck() {
  try {
    const webHealth = await checkWebHealth();
    console.log('✅ Web application health check passed');
    console.log(`📊 Status: ${webHealth.status} (HTTP ${webHealth.statusCode})`);
    process.exit(0);
  } catch (error) {
    console.log('❌ Web application health check failed:', error.message);
    process.exit(1);
  }
}

// Run health check
if (require.main === module) {
  performHealthCheck();
}

module.exports = { performHealthCheck, checkWebHealth };
