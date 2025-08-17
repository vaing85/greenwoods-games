const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Security configuration
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'greenwood-secret-key-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000, // 15 minutes
};

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// Rate limiters for different endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const gameLimiter = createRateLimit(
  60 * 1000, // 1 minute
  100, // limit each IP to 100 game requests per minute
  'Too many game requests, please slow down'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  1000, // limit each IP to 1000 requests per windowMs
  'Too many requests, please try again later'
);

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'none'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input validation utilities
const validateInput = {
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(email) && email.length <= 254;
  },
  
  username: (username) => {
    if (!username || typeof username !== 'string') return false;
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  },
  
  password: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8 && password.length <= 128;
  },
  
  betAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000 && Number.isFinite(num);
  },
  
  gameId: (gameId) => {
    if (!gameId || typeof gameId !== 'string') return false;
    return /^[a-zA-Z0-9-_]{1,50}$/.test(gameId);
  },
  
  sanitizeString: (str, maxLength = 1000) => {
    if (!str || typeof str !== 'string') return '';
    return validator.escape(str.slice(0, maxLength));
  },
};

// JWT token utilities
const tokenUtils = {
  generateTokens: (payload) => {
    const accessToken = jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN,
    });
    
    const refreshToken = jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    });
    
    return { accessToken, refreshToken };
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  refreshAccessToken: (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, SECURITY_CONFIG.JWT_SECRET);
      const newTokens = tokenUtils.generateTokens({
        userId: decoded.userId,
        username: decoded.username,
      });
      return newTokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },
};

// Password utilities
const passwordUtils = {
  hash: async (password) => {
    return await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
  },
  
  compare: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
  
  generateSecureToken: () => {
    return require('crypto').randomBytes(32).toString('hex');
  },
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = tokenUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Request validation middleware
const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, validator] of Object.entries(validationRules)) {
      const value = req.body[field];
      
      if (validator.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null && !validator.validate(value)) {
        errors.push(`${field} is invalid`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
  };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  // Database errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    return res.status(500).json({ error: 'Database error' });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(statusCode).json({ error: message });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  });
  
  next();
};

module.exports = {
  SECURITY_CONFIG,
  authLimiter,
  gameLimiter,
  generalLimiter,
  securityHeaders,
  validateInput,
  tokenUtils,
  passwordUtils,
  authenticateToken,
  validateRequest,
  errorHandler,
  requestLogger,
};
