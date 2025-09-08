#!/usr/bin/env node

/**
 * Greenwood Games - Health Check Script
 * This script performs comprehensive health checks for the server
 */

const http = require('http');
const mongoose = require('mongoose');

// Configuration
const SERVER_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/health';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/greenwood_games?authSource=admin';

/**
 * Check server health endpoint
 */
function checkServerHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const healthData = JSON.parse(data);
            if (healthData.status === 'healthy') {
              resolve({ service: 'server', status: 'healthy', data: healthData });
            } else {
              reject(new Error(`Server health check failed: ${healthData.status}`));
            }
          } catch (error) {
            reject(new Error(`Invalid health response: ${error.message}`));
          }
        } else {
          reject(new Error(`Server returned status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Server health check failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Server health check timeout'));
    });

    req.end();
  });
}

/**
 * Check MongoDB connection
 */
function checkMongoDBHealth() {
  return new Promise((resolve, reject) => {
    mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    })
    .then(() => {
      mongoose.connection.db.admin().ping()
        .then(() => {
          resolve({ service: 'mongodb', status: 'healthy' });
          mongoose.disconnect();
        })
        .catch((error) => {
          reject(new Error(`MongoDB ping failed: ${error.message}`));
          mongoose.disconnect();
        });
    })
    .catch((error) => {
      reject(new Error(`MongoDB connection failed: ${error.message}`));
    });
  });
}

/**
 * Main health check function
 */
async function performHealthCheck() {
  const results = [];
  let allHealthy = true;

  try {
    // Check server health
    const serverHealth = await checkServerHealth();
    results.push(serverHealth);
    console.log('✅ Server health check passed');
  } catch (error) {
    results.push({ service: 'server', status: 'unhealthy', error: error.message });
    console.log('❌ Server health check failed:', error.message);
    allHealthy = false;
  }

  try {
    // Check MongoDB health
    const mongoHealth = await checkMongoDBHealth();
    results.push(mongoHealth);
    console.log('✅ MongoDB health check passed');
  } catch (error) {
    results.push({ service: 'mongodb', status: 'unhealthy', error: error.message });
    console.log('❌ MongoDB health check failed:', error.message);
    allHealthy = false;
  }

  // Output results
  console.log('\n📊 Health Check Results:');
  results.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Exit with appropriate code
  process.exit(allHealthy ? 0 : 1);
}

// Run health check
if (require.main === module) {
  performHealthCheck().catch((error) => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  });
}

module.exports = { performHealthCheck, checkServerHealth, checkMongoDBHealth };