const mongoose = require('mongoose');

const pokerRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cash', 'tournament', 'sit-n-go'],
    default: 'cash'
  },
  gameType: {
    type: String,
    enum: ['texas-holdem', 'omaha', 'seven-card-stud'],
    default: 'texas-holdem'
  },
  stakes: {
    smallBlind: {
      type: Number,
      required: true
    },
    bigBlind: {
      type: Number,
      required: true
    },
    minBuyIn: {
      type: Number,
      required: true
    },
    maxBuyIn: {
      type: Number,
      required: true
    }
  },
  maxPlayers: {
    type: Number,
    default: 6,
    min: 2,
    max: 10
  },
  currentPlayers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seat: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    chips: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'sitting-out', 'away'],
      default: 'active'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gameState: {
    phase: {
      type: String,
      enum: ['waiting', 'pre-flop', 'flop', 'turn', 'river', 'showdown'],
      default: 'waiting'
    },
    dealerPosition: {
      type: Number,
      default: 0
    },
    currentPlayerPosition: {
      type: Number,
      default: 0
    },
    pot: {
      type: Number,
      default: 0
    },
    communityCards: [{
      suit: {
        type: String,
        enum: ['hearts', 'diamonds', 'clubs', 'spades']
      },
      rank: {
        type: String,
        enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
      }
    }],
    playerCards: [{
      playerId: mongoose.Schema.Types.ObjectId,
      cards: [{
        suit: {
          type: String,
          enum: ['hearts', 'diamonds', 'clubs', 'spades']
        },
        rank: {
          type: String,
          enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        }
      }]
    }],
    currentBet: {
      type: Number,
      default: 0
    },
    lastAction: {
      playerId: mongoose.Schema.Types.ObjectId,
      action: {
        type: String,
        enum: ['fold', 'check', 'call', 'bet', 'raise', 'all-in']
      },
      amount: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  },
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    password: String,
    autoStart: {
      type: Boolean,
      default: true
    },
    actionTimeout: {
      type: Number,
      default: 30 // seconds
    },
    allowObservers: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalHands: {
      type: Number,
      default: 0
    },
    totalPot: {
      type: Number,
      default: 0
    },
    averagePot: {
      type: Number,
      default: 0
    },
    handsPerHour: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  observers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
pokerRoomSchema.index({ type: 1, status: 1 });
pokerRoomSchema.index({ 'stakes.smallBlind': 1, 'stakes.bigBlind': 1 });
pokerRoomSchema.index({ 'currentPlayers.user': 1 });

// Methods
pokerRoomSchema.methods.addPlayer = function(userId, chips, seat) {
  if (this.currentPlayers.length >= this.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (this.currentPlayers.some(p => p.seat === seat)) {
    throw new Error('Seat is already taken');
  }
  
  if (chips < this.stakes.minBuyIn || chips > this.stakes.maxBuyIn) {
    throw new Error('Invalid buy-in amount');
  }
  
  this.currentPlayers.push({
    user: userId,
    seat: seat,
    chips: chips,
    status: 'active'
  });
  
  return this.save();
};

pokerRoomSchema.methods.removePlayer = function(userId) {
  this.currentPlayers = this.currentPlayers.filter(
    p => p.user.toString() !== userId.toString()
  );
  return this.save();
};

pokerRoomSchema.methods.getAvailableSeats = function() {
  const takenSeats = this.currentPlayers.map(p => p.seat);
  const availableSeats = [];
  
  for (let i = 1; i <= this.maxPlayers; i++) {
    if (!takenSeats.includes(i)) {
      availableSeats.push(i);
    }
  }
  
  return availableSeats;
};

pokerRoomSchema.methods.canStartGame = function() {
  const activePlayers = this.currentPlayers.filter(p => p.status === 'active');
  return activePlayers.length >= 2;
};

// Static methods
pokerRoomSchema.statics.findAvailableRooms = function(stakes, gameType) {
  const query = {
    status: 'active',
    $expr: { $lt: [{ $size: '$currentPlayers' }, '$maxPlayers'] }
  };
  
  if (stakes) {
    query['stakes.smallBlind'] = stakes.smallBlind;
    query['stakes.bigBlind'] = stakes.bigBlind;
  }
  
  if (gameType) {
    query.gameType = gameType;
  }
  
  return this.find(query).populate('currentPlayers.user', 'username profile.displayName');
};

module.exports = mongoose.model('PokerRoom', pokerRoomSchema);
