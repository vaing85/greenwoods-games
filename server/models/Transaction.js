const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund', 'fee']
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  gameSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession'
  },
  gameType: {
    type: String,
    enum: ['slots', 'blackjack', 'roulette', 'poker']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  reference: {
    type: String,
    unique: true
  },
  metadata: {
    gameDetails: mongoose.Schema.Types.Mixed,
    paymentMethod: String,
    processingTime: Number,
    fees: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  createdBy: {
    type: String,
    enum: ['system', 'user', 'admin'],
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ gameSession: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ status: 1 });

// Generate unique reference
transactionSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to create transaction
transactionSchema.statics.createTransaction = async function(data) {
  const { user, type, amount, gameSession, gameType, description, metadata = {} } = data;
  
  // Get user's current balance
  const User = mongoose.model('User');
  const userDoc = await User.findById(user);
  
  if (!userDoc) {
    throw new Error('User not found');
  }
  
  const balanceBefore = userDoc.balance;
  let balanceAfter;
  
  // Calculate new balance
  if (['deposit', 'win', 'bonus', 'refund'].includes(type)) {
    balanceAfter = balanceBefore + amount;
  } else if (['withdrawal', 'bet', 'fee'].includes(type)) {
    balanceAfter = balanceBefore - amount;
    
    if (balanceAfter < 0) {
      throw new Error('Insufficient balance');
    }
  } else {
    throw new Error('Invalid transaction type');
  }
  
  // Create transaction
  const transaction = new this({
    user,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    gameSession,
    gameType,
    description,
    metadata
  });
  
  // Update user balance
  userDoc.balance = balanceAfter;
  
  // Save both in a transaction-like manner
  await transaction.save();
  await userDoc.save();
  
  return transaction;
};

// Get user transaction summary
transactionSchema.statics.getUserSummary = async function(userId, dateRange = {}) {
  const matchStage = { user: mongoose.Types.ObjectId(userId) };
  
  if (dateRange.from || dateRange.to) {
    matchStage.createdAt = {};
    if (dateRange.from) matchStage.createdAt.$gte = new Date(dateRange.from);
    if (dateRange.to) matchStage.createdAt.$lte = new Date(dateRange.to);
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
        minAmount: { $min: '$amount' }
      }
    }
  ]);
  
  return summary;
};

module.exports = mongoose.model('Transaction', transactionSchema);
