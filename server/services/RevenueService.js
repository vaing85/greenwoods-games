// Revenue Tracking and Analytics Service
const mongoose = require('mongoose');

// Revenue tracking schema
const RevenueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gaming', 'crypto', 'tournament', 'subscription', 'affiliate', 'advertising'],
    required: true
  },
  source: {
    type: String,
    required: true // e.g., 'blackjack', 'bitcoin_deposit', 'tournament_entry'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  gameId: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Revenue = mongoose.model('Revenue', RevenueSchema);

class RevenueService {
  constructor() {
    this.dailyTargets = {
      gaming: 1000,      // $1000 daily gaming revenue
      crypto: 500,       // $500 daily crypto fees
      tournament: 200,   // $200 daily tournament fees
      subscription: 100, // $100 daily subscriptions
      affiliate: 50,     // $50 daily affiliate commissions
      advertising: 25    // $25 daily advertising revenue
    };
  }

  // Record gaming revenue (house edge)
  async recordGamingRevenue(userId, gameType, betAmount, houseEdge, gameId = null) {
    const revenue = betAmount * houseEdge;
    
    const record = new Revenue({
      type: 'gaming',
      source: gameType,
      amount: revenue,
      userId: userId,
      gameId: gameId,
      metadata: {
        betAmount: betAmount,
        houseEdge: houseEdge,
        gameType: gameType
      }
    });

    await record.save();
    return record;
  }

  // Record cryptocurrency transaction fees
  async recordCryptoRevenue(userId, transactionType, amount, currency, feePercentage) {
    const revenue = amount * feePercentage;
    
    const record = new Revenue({
      type: 'crypto',
      source: `${currency}_${transactionType}`,
      amount: revenue,
      currency: currency,
      userId: userId,
      metadata: {
        transactionAmount: amount,
        feePercentage: feePercentage,
        transactionType: transactionType
      }
    });

    await record.save();
    return record;
  }

  // Record tournament entry fees
  async recordTournamentRevenue(tournamentId, entryFees, platformFeePercentage) {
    const revenue = entryFees * platformFeePercentage;
    
    const record = new Revenue({
      type: 'tournament',
      source: `tournament_${tournamentId}`,
      amount: revenue,
      metadata: {
        tournamentId: tournamentId,
        totalEntryFees: entryFees,
        platformFeePercentage: platformFeePercentage
      }
    });

    await record.save();
    return record;
  }

  // Record subscription revenue
  async recordSubscriptionRevenue(userId, planName, amount, currency = 'USD') {
    const record = new Revenue({
      type: 'subscription',
      source: `subscription_${planName}`,
      amount: amount,
      currency: currency,
      userId: userId,
      metadata: {
        planName: planName
      }
    });

    await record.save();
    return record;
  }

  // Record affiliate commission
  async recordAffiliateRevenue(affiliateId, referredUserId, amount, commissionType) {
    const record = new Revenue({
      type: 'affiliate',
      source: `affiliate_${commissionType}`,
      amount: amount,
      userId: referredUserId,
      metadata: {
        affiliateId: affiliateId,
        commissionType: commissionType
      }
    });

    await record.save();
    return record;
  }

  // Record advertising revenue
  async recordAdvertisingRevenue(adType, impressions, cpm) {
    const revenue = (impressions / 1000) * cpm;
    
    const record = new Revenue({
      type: 'advertising',
      source: `ad_${adType}`,
      amount: revenue,
      metadata: {
        adType: adType,
        impressions: impressions,
        cpm: cpm
      }
    });

    await record.save();
    return record;
  }

  // Get daily revenue summary
  async getDailyRevenue(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const revenue = await Revenue.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    const summary = {
      date: startOfDay,
      totalRevenue: 0,
      breakdown: {},
      targets: this.dailyTargets,
      performance: {}
    };

    revenue.forEach(item => {
      summary.breakdown[item._id] = {
        amount: item.totalAmount,
        count: item.count,
        average: item.averageAmount
      };
      summary.totalRevenue += item.totalAmount;
    });

    // Calculate performance vs targets
    Object.keys(this.dailyTargets).forEach(type => {
      const actual = summary.breakdown[type]?.amount || 0;
      const target = this.dailyTargets[type];
      summary.performance[type] = {
        actual: actual,
        target: target,
        percentage: target > 0 ? (actual / target) * 100 : 0,
        status: actual >= target ? 'achieved' : 'below_target'
      };
    });

    return summary;
  }

  // Get monthly revenue summary
  async getMonthlyRevenue(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const revenue = await Revenue.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            day: { $dayOfMonth: '$timestamp' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          dailyBreakdown: {
            $push: {
              day: '$_id.day',
              amount: '$totalAmount',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$totalAmount' },
          totalCount: { $sum: '$count' }
        }
      }
    ]);

    return {
      year: year,
      month: month,
      totalRevenue: revenue.reduce((sum, item) => sum + item.totalAmount, 0),
      breakdown: revenue
    };
  }

  // Get top performing games
  async getTopPerformingGames(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const games = await Revenue.aggregate([
      {
        $match: {
          type: 'gaming',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          totalRevenue: { $sum: '$amount' },
          totalBets: { $sum: '$metadata.betAmount' },
          playerCount: { $addToSet: '$userId' },
          averageBet: { $avg: '$metadata.betAmount' },
          houseEdge: { $avg: '$metadata.houseEdge' }
        }
      },
      {
        $addFields: {
          uniquePlayers: { $size: '$playerCount' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return games;
  }

  // Get user lifetime value
  async getUserLifetimeValue(userId) {
    const userRevenue = await Revenue.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalValue = userRevenue.reduce((sum, item) => sum + item.totalAmount, 0);
    
    return {
      userId: userId,
      totalLifetimeValue: totalValue,
      breakdown: userRevenue,
      averagePerTransaction: totalValue / userRevenue.reduce((sum, item) => sum + item.count, 0)
    };
  }

  // Get revenue projections
  async getRevenueProjections(days = 30) {
    const historicalData = await Revenue.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          dailyRevenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Simple linear projection
    const dailyAverages = historicalData.map(item => item.dailyRevenue);
    const averageDailyRevenue = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
    
    const projections = [];
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      projections.push({
        date: futureDate,
        projectedRevenue: averageDailyRevenue,
        confidence: dailyAverages.length > 7 ? 'high' : 'low'
      });
    }

    return {
      currentAverage: averageDailyRevenue,
      projections: projections,
      totalProjected30Days: averageDailyRevenue * 30
    };
  }

  // Calculate house edge performance
  async getHouseEdgePerformance(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performance = await Revenue.aggregate([
      {
        $match: {
          type: 'gaming',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          totalRevenue: { $sum: '$amount' },
          totalBets: { $sum: '$metadata.betAmount' },
          actualHouseEdge: {
            $avg: {
              $multiply: [
                { $divide: ['$amount', '$metadata.betAmount'] },
                100
              ]
            }
          },
          expectedHouseEdge: { $avg: '$metadata.houseEdge' }
        }
      },
      {
        $addFields: {
          performanceRatio: {
            $divide: ['$actualHouseEdge', { $multiply: ['$expectedHouseEdge', 100] }]
          }
        }
      }
    ]);

    return performance;
  }
}

module.exports = RevenueService;
