const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 1000,
    min: 0
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalGamesPlayed: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalLosses: {
      type: Number,
      default: 0
    },
    biggestWin: {
      type: Number,
      default: 0
    },
    favoriteGame: String,
    achievements: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    soundEnabled: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'classic'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVIP: {
    type: Boolean,
    default: false
  },
  vipLevel: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'statistics.totalWinnings': -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
      'security.loginAttempts': 1,
      'security.lockUntil': 1
    }
  });
};

// Update balance safely
userSchema.methods.updateBalance = function(amount, transaction) {
  const newBalance = this.balance + amount;
  
  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }
  
  this.balance = newBalance;
  
  // Update statistics
  if (amount > 0) {
    this.statistics.totalWinnings += amount;
    if (amount > this.statistics.biggestWin) {
      this.statistics.biggestWin = amount;
    }
  } else {
    this.statistics.totalLosses += Math.abs(amount);
  }
  
  return this.save();
};

// Add achievement
userSchema.methods.addAchievement = function(name, description) {
  const existingAchievement = this.statistics.achievements.find(a => a.name === name);
  
  if (!existingAchievement) {
    this.statistics.achievements.push({
      name,
      description,
      earnedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Calculate level based on experience
userSchema.methods.calculateLevel = function() {
  const baseExp = 1000;
  const level = Math.floor(this.statistics.experience / baseExp) + 1;
  
  if (level > this.profile.level) {
    this.profile.level = level;
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema);
