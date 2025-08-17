const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['slots', 'blackjack', 'roulette', 'poker']
  },
  gameSubtype: {
    type: String, // e.g., 'classic', 'egyptian', 'ocean', 'space' for slots
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  initialBalance: {
    type: Number,
    required: true
  },
  finalBalance: Number,
  totalBet: {
    type: Number,
    default: 0
  },
  totalWon: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  biggestWin: {
    type: Number,
    default: 0
  },
  longestWinStreak: {
    type: Number,
    default: 0
  },
  currentWinStreak: {
    type: Number,
    default: 0
  },
  actions: [{
    type: {
      type: String,
      enum: ['bet', 'win', 'lose', 'spin', 'hit', 'stand', 'fold', 'call', 'raise']
    },
    amount: Number,
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    device: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for performance
gameSessionSchema.index({ user: 1, gameType: 1 });
gameSessionSchema.index({ startTime: -1 });
gameSessionSchema.index({ status: 1 });
gameSessionSchema.index({ sessionId: 1 });

// Calculate session duration
gameSessionSchema.virtual('duration').get(function() {
  if (!this.endTime) return null;
  return this.endTime - this.startTime;
});

// Calculate net profit/loss
gameSessionSchema.virtual('netResult').get(function() {
  return this.totalWon - this.totalBet;
});

// Calculate return to player percentage
gameSessionSchema.virtual('rtp').get(function() {
  if (this.totalBet === 0) return 0;
  return (this.totalWon / this.totalBet) * 100;
});

// Add action to session
gameSessionSchema.methods.addAction = function(type, amount, details = {}) {
  this.actions.push({
    type,
    amount,
    details,
    timestamp: new Date()
  });
  
  // Update session statistics
  this.gamesPlayed += 1;
  
  if (type === 'bet') {
    this.totalBet += amount;
  } else if (type === 'win') {
    this.totalWon += amount;
    
    if (amount > this.biggestWin) {
      this.biggestWin = amount;
    }
    
    this.currentWinStreak += 1;
    if (this.currentWinStreak > this.longestWinStreak) {
      this.longestWinStreak = this.currentWinStreak;
    }
  } else if (type === 'lose') {
    this.currentWinStreak = 0;
  }
  
  return this.save();
};

// End session
gameSessionSchema.methods.endSession = function(finalBalance) {
  this.endTime = new Date();
  this.finalBalance = finalBalance;
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('GameSession', gameSessionSchema);
