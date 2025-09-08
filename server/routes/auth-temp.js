const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'greenwood_games_secret_key_2024';

// Temporary in-memory storage for development
// In production, replace with MongoDB models
let users = [];
let transactions = [];

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      balance: 1000, // Starting bonus
      profile: {
        displayName: username,
        level: 1,
        vipTier: 'Bronze',
        joinDate: new Date(),
        lastActive: new Date()
      },
      statistics: {
        totalGamesPlayed: 0,
        totalWagered: 0,
        totalWon: 0,
        biggestWin: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      achievements: [],
      preferences: {
        soundEnabled: true,
        animationsEnabled: true,
        autoSpin: false
      },
      security: {
        failedLoginAttempts: 0,
        lastLogin: new Date(),
        accountLocked: false
      },
      createdAt: new Date()
    };

    users.push(user);

    // Create welcome bonus transaction
    transactions.push({
      id: Date.now() + '_bonus',
      userId: user.id,
      type: 'bonus',
      amount: 1000,
      balanceBefore: 0,
      balanceAfter: 1000,
      description: 'Welcome bonus for new account',
      createdAt: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        level: user.profile.level
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email or username
    const user = users.find(u => u.email === email || u.username === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.security.accountLocked && user.security.lockUntil > new Date()) {
      return res.status(423).json({ 
        error: 'Account temporarily locked. Try again later.',
        lockUntil: user.security.lockUntil
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      user.security.failedLoginAttempts += 1;
      user.security.lastFailedLogin = new Date();
      
      // Lock account after 5 failed attempts
      if (user.security.failedLoginAttempts >= 5) {
        user.security.accountLocked = true;
        user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed login attempts on successful login
    user.security.failedLoginAttempts = 0;
    user.security.accountLocked = false;
    user.security.lockUntil = null;
    user.security.lastLogin = new Date();
    user.profile.lastActive = new Date();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        level: user.profile.level,
        vipTier: user.profile.vipTier,
        achievements: user.achievements.length
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        profile: user.profile,
        statistics: user.statistics,
        achievements: user.achievements,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userTransactions = transactions
      .filter(t => t.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50); // Last 50 transactions

    res.json({ transactions: userTransactions });

  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Update balance (for game results)
router.post('/update-balance', authenticateToken, async (req, res) => {
  try {
    const { amount, type, gameType, description } = req.body;
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balanceBefore = user.balance;
    let balanceAfter;

    if (['win', 'bonus'].includes(type)) {
      balanceAfter = balanceBefore + amount;
    } else if (['bet', 'loss'].includes(type)) {
      balanceAfter = balanceBefore - amount;
      if (balanceAfter < 0) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    // Update user balance
    user.balance = balanceAfter;

    // Update statistics
    if (type === 'bet') {
      user.statistics.totalWagered += amount;
      user.statistics.totalGamesPlayed += 1;
    } else if (type === 'win') {
      user.statistics.totalWon += amount;
      if (amount > user.statistics.biggestWin) {
        user.statistics.biggestWin = amount;
      }
    }

    // Create transaction record
    transactions.push({
      id: Date.now() + '_' + type,
      userId: user.id,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      gameType,
      description,
      createdAt: new Date()
    });

    res.json({
      success: true,
      balance: user.balance,
      transaction: {
        type,
        amount,
        balanceAfter,
        description
      }
    });

  } catch (error) {
    console.error('Balance update error:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, password reset instructions have been sent.' 
      });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // For demo purposes, we'll just log the reset link
    console.log(`Password reset link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);
    
    // In a real application, you would send an email here
    // await sendPasswordResetEmail(email, resetToken);

    res.json({ 
      success: true, 
      message: 'Password reset instructions have been sent to your email address.',
      // For demo purposes only - remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request' 
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    
    // Update last password change
    user.security.lastPasswordChange = new Date();

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while resetting your password' 
    });
  }
});

module.exports = router;
