const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['scheduled', 'sit-n-go', 'freeroll', 'satellite'],
    required: true
  },
  gameType: {
    type: String,
    enum: ['texas-holdem', 'omaha', 'seven-card-stud'],
    default: 'texas-holdem'
  },
  structure: {
    buyIn: {
      type: Number,
      required: true,
      min: 0
    },
    fee: {
      type: Number,
      default: 0,
      min: 0
    },
    startingChips: {
      type: Number,
      required: true,
      default: 1500
    },
    blindStructure: [{
      level: {
        type: Number,
        required: true
      },
      smallBlind: {
        type: Number,
        required: true
      },
      bigBlind: {
        type: Number,
        required: true
      },
      ante: {
        type: Number,
        default: 0
      },
      duration: {
        type: Number,
        required: true,
        default: 10 // minutes
      }
    }],
    rebuyPeriod: {
      type: Number,
      default: 0 // levels, 0 = no rebuys
    },
    addOnPeriod: {
      type: Number,
      default: 0 // levels, 0 = no add-ons
    }
  },
  schedule: {
    startTime: {
      type: Date,
      required: function() { return this.type === 'scheduled'; }
    },
    registrationStart: {
      type: Date,
      required: function() { return this.type === 'scheduled'; }
    },
    registrationEnd: {
      type: Date,
      required: function() { return this.type === 'scheduled'; }
    },
    lateRegistrationMinutes: {
      type: Number,
      default: 30
    }
  },
  participants: {
    maxPlayers: {
      type: Number,
      required: true,
      min: 2
    },
    minPlayers: {
      type: Number,
      required: true,
      min: 2
    },
    currentPlayers: {
      type: Number,
      default: 0
    },
    registeredPlayers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      registrationTime: {
        type: Date,
        default: Date.now
      },
      tableNumber: Number,
      seatNumber: Number,
      chips: {
        type: Number,
        default: function() { return this.structure.startingChips; }
      },
      status: {
        type: String,
        enum: ['registered', 'active', 'eliminated', 'withdrawn'],
        default: 'registered'
      },
      eliminationTime: Date,
      finalPosition: Number,
      rebuysUsed: {
        type: Number,
        default: 0
      },
      addOnsUsed: {
        type: Number,
        default: 0
      }
    }]
  },
  prizePool: {
    total: {
      type: Number,
      default: 0
    },
    distribution: [{
      position: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    guaranteed: {
      type: Number,
      default: 0
    }
  },
  gameState: {
    status: {
      type: String,
      enum: ['scheduled', 'registering', 'starting', 'running', 'paused', 'finished', 'cancelled'],
      default: 'scheduled'
    },
    currentLevel: {
      type: Number,
      default: 1
    },
    levelStartTime: Date,
    nextLevelTime: Date,
    tablesInPlay: [{
      tableNumber: {
        type: Number,
        required: true
      },
      players: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        seat: Number,
        chips: Number,
        status: {
          type: String,
          enum: ['active', 'sitting-out', 'eliminated']
        }
      }],
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    pauseReason: String,
    pauseTime: Date
  },
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    password: String,
    allowObservers: {
      type: Boolean,
      default: true
    },
    tableSize: {
      type: Number,
      default: 6,
      min: 2,
      max: 10
    },
    pauseOnFinalTable: {
      type: Boolean,
      default: true
    },
    breakDuration: {
      type: Number,
      default: 5 // minutes
    },
    breakEveryLevels: {
      type: Number,
      default: 6
    }
  },
  statistics: {
    totalEntries: {
      type: Number,
      default: 0
    },
    totalRebuys: {
      type: Number,
      default: 0
    },
    totalAddOns: {
      type: Number,
      default: 0
    },
    actualStartTime: Date,
    finishTime: Date,
    duration: Number, // minutes
    handsPlayed: {
      type: Number,
      default: 0
    },
    averageChipStack: {
      type: Number,
      default: 0
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
tournamentSchema.index({ type: 1, 'gameState.status': 1 });
tournamentSchema.index({ 'schedule.startTime': 1 });
tournamentSchema.index({ 'participants.registeredPlayers.user': 1 });
tournamentSchema.index({ 'gameState.status': 1, 'participants.currentPlayers': 1 });

// Virtual for calculating prize pool
tournamentSchema.virtual('calculatedPrizePool').get(function() {
  const totalBuyIns = this.participants.currentPlayers * this.structure.buyIn;
  const totalRebuys = this.statistics.totalRebuys * this.structure.buyIn;
  const totalAddOns = this.statistics.totalAddOns * this.structure.buyIn;
  
  return Math.max(totalBuyIns + totalRebuys + totalAddOns, this.prizePool.guaranteed);
});

// Methods
tournamentSchema.methods.canRegister = function(userId) {
  const now = new Date();
  
  // Check if tournament is in registration period
  if (this.type === 'scheduled') {
    if (now < this.schedule.registrationStart || now > this.schedule.registrationEnd) {
      return { canRegister: false, reason: 'Registration period closed' };
    }
  }
  
  // Check if tournament is full
  if (this.participants.currentPlayers >= this.participants.maxPlayers) {
    return { canRegister: false, reason: 'Tournament is full' };
  }
  
  // Check if already registered
  const isRegistered = this.participants.registeredPlayers.some(
    p => p.user.toString() === userId.toString()
  );
  
  if (isRegistered) {
    return { canRegister: false, reason: 'Already registered' };
  }
  
  // Check tournament status
  if (!['scheduled', 'registering'].includes(this.gameState.status)) {
    return { canRegister: false, reason: 'Tournament not accepting registrations' };
  }
  
  return { canRegister: true };
};

tournamentSchema.methods.registerPlayer = function(userId) {
  const canRegisterResult = this.canRegister(userId);
  
  if (!canRegisterResult.canRegister) {
    throw new Error(canRegisterResult.reason);
  }
  
  this.participants.registeredPlayers.push({
    user: userId,
    chips: this.structure.startingChips
  });
  
  this.participants.currentPlayers += 1;
  this.statistics.totalEntries += 1;
  
  // Auto-start sit-n-go if full
  if (this.type === 'sit-n-go' && this.participants.currentPlayers === this.participants.maxPlayers) {
    this.gameState.status = 'starting';
  }
  
  return this.save();
};

tournamentSchema.methods.unregisterPlayer = function(userId) {
  const playerIndex = this.participants.registeredPlayers.findIndex(
    p => p.user.toString() === userId.toString()
  );
  
  if (playerIndex === -1) {
    throw new Error('Player not registered');
  }
  
  if (['running', 'finished'].includes(this.gameState.status)) {
    throw new Error('Cannot unregister from active tournament');
  }
  
  this.participants.registeredPlayers.splice(playerIndex, 1);
  this.participants.currentPlayers -= 1;
  
  return this.save();
};

tournamentSchema.methods.eliminatePlayer = function(userId, position) {
  const player = this.participants.registeredPlayers.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (player) {
    player.status = 'eliminated';
    player.eliminationTime = new Date();
    player.finalPosition = position;
    
    // Remove from active tables
    this.gameState.tablesInPlay.forEach(table => {
      table.players = table.players.filter(
        p => p.user.toString() !== userId.toString()
      );
    });
    
    this.participants.currentPlayers -= 1;
    
    // Check if tournament is finished
    if (this.participants.currentPlayers <= 1) {
      this.gameState.status = 'finished';
      this.statistics.finishTime = new Date();
      this.statistics.duration = Math.round(
        (this.statistics.finishTime - this.statistics.actualStartTime) / (1000 * 60)
      );
    }
  }
  
  return this.save();
};

tournamentSchema.methods.calculatePrizeDistribution = function() {
  const totalPrize = this.calculatedPrizePool;
  
  // Standard prize distribution (can be customized)
  const distributions = {
    2: [{ position: 1, percentage: 100 }],
    3: [{ position: 1, percentage: 70 }, { position: 2, percentage: 30 }],
    4: [{ position: 1, percentage: 50 }, { position: 2, percentage: 30 }, { position: 3, percentage: 20 }],
    // Add more distributions for larger tournaments
  };
  
  const playerCount = this.statistics.totalEntries;
  const payoutSpots = Math.min(Math.floor(playerCount / 10) + 1, playerCount);
  
  let distribution = distributions[payoutSpots] || distributions[4];
  
  this.prizePool.distribution = distribution.map(d => ({
    position: d.position,
    percentage: d.percentage,
    amount: Math.round(totalPrize * d.percentage / 100)
  }));
  
  this.prizePool.total = totalPrize;
  
  return this.save();
};

// Static methods
tournamentSchema.statics.findAvailableTournaments = function(type, gameType) {
  const query = {
    'gameState.status': { $in: ['scheduled', 'registering'] },
    $expr: { $lt: ['$participants.currentPlayers', '$participants.maxPlayers'] }
  };
  
  if (type) query.type = type;
  if (gameType) query.gameType = gameType;
  
  return this.find(query).populate('participants.registeredPlayers.user', 'username profile.displayName');
};

tournamentSchema.statics.findActiveTournaments = function() {
  return this.find({
    'gameState.status': { $in: ['running', 'paused'] }
  }).populate('participants.registeredPlayers.user', 'username profile.displayName');
};

// Pre-save middleware to update calculated fields
tournamentSchema.pre('save', function(next) {
  // Update next level time
  if (this.gameState.status === 'running' && this.gameState.levelStartTime) {
    const currentLevelDuration = this.structure.blindStructure[this.gameState.currentLevel - 1]?.duration || 10;
    this.gameState.nextLevelTime = new Date(
      this.gameState.levelStartTime.getTime() + currentLevelDuration * 60 * 1000
    );
  }
  
  next();
});

module.exports = mongoose.model('Tournament', tournamentSchema);
