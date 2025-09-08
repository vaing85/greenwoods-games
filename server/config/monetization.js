// Greenwood Games Monetization Configuration
// This file contains all revenue settings and fee structures

module.exports = {
  // ============ GAMING REVENUE ============
  gaming: {
    // House edge percentages for each game
    houseEdge: {
      slots: {
        classic: 0.03,      // 3% house edge
        video: 0.04,        // 4% house edge
        progressive: 0.05   // 5% house edge
      },
      blackjack: {
        standard: 0.005,    // 0.5% house edge
        perfect: 0.001      // 0.1% house edge (perfect strategy)
      },
      roulette: {
        european: 0.027,    // 2.7% house edge
        american: 0.053     // 5.3% house edge
      },
      poker: {
        rake: 0.05,         // 5% rake per hand
        tournament: 0.10    // 10% tournament fee
      },
      baccarat: {
        banker: 0.0105,     // 1.05% house edge
        player: 0.0124      // 1.24% house edge
      },
      craps: {
        pass: 0.0141,       // 1.41% house edge
        dontPass: 0.0136    // 1.36% house edge
      }
    },

    // Minimum and maximum bet limits
    bettingLimits: {
      slots: { min: 0.01, max: 1000 },
      blackjack: { min: 1, max: 5000 },
      roulette: { min: 0.50, max: 10000 },
      poker: { min: 0.25, max: 10000 },
      baccarat: { min: 1, max: 50000 },
      craps: { min: 1, max: 10000 }
    }
  },

  // ============ CRYPTOCURRENCY FEES ============
  crypto: {
    // Transaction fees (percentage)
    fees: {
      deposit: 0.01,        // 1% deposit fee
      withdrawal: 0.02,     // 2% withdrawal fee
      exchange: 0.005       // 0.5% exchange fee
    },

    // Minimum amounts
    minimums: {
      deposit: {
        BTC: 0.001,         // ~$45
        ETH: 0.01,          // ~$30
        USDT: 10,           // $10
        USDC: 10            // $10
      },
      withdrawal: {
        BTC: 0.002,         // ~$90
        ETH: 0.02,          // ~$60
        USDT: 20,           // $20
        USDC: 20            // $20
      }
    },

    // Supported currencies and their settings
    currencies: {
      BTC: {
        enabled: true,
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        minConfirmations: 1
      },
      ETH: {
        enabled: true,
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        minConfirmations: 12
      },
      USDT: {
        enabled: true,
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        minConfirmations: 12
      },
      USDC: {
        enabled: true,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        minConfirmations: 12
      }
    }
  },

  // ============ TOURNAMENT FEES ============
  tournaments: {
    // Platform fee percentage of total prize pool
    platformFee: 0.15,     // 15% platform fee

    // Entry fee tiers
    entryFees: {
      freeroll: 0,          // Free tournaments
      micro: 1,             // $1 tournaments
      low: 5,               // $5 tournaments
      medium: 25,           // $25 tournaments
      high: 100,            // $100 tournaments
      vip: 500              // $500+ VIP tournaments
    },

    // Prize pool distribution
    prizeDistribution: {
      winner: 0.50,         // 50% to winner
      second: 0.30,         // 30% to second place
      third: 0.20           // 20% to third place
    }
  },

  // ============ VIP SYSTEM ============
  vip: {
    // VIP tiers and requirements
    tiers: {
      bronze: {
        name: 'Bronze',
        minDeposit: 100,
        minWagered: 1000,
        benefits: ['5% bonus on deposits', 'Priority support']
      },
      silver: {
        name: 'Silver',
        minDeposit: 500,
        minWagered: 5000,
        benefits: ['10% bonus on deposits', 'Exclusive tournaments', 'Personal manager']
      },
      gold: {
        name: 'Gold',
        minDeposit: 2000,
        minWagered: 20000,
        benefits: ['15% bonus on deposits', 'Higher betting limits', 'VIP events']
      },
      platinum: {
        name: 'Platinum',
        minDeposit: 10000,
        minWagered: 100000,
        benefits: ['20% bonus on deposits', 'Custom games', 'Private tables']
      }
    }
  },

  // ============ BONUS SYSTEM ============
  bonuses: {
    // Welcome bonus
    welcome: {
      enabled: true,
      percentage: 1.0,      // 100% match bonus
      maxAmount: 1000,      // Maximum $1000 bonus
      wageringRequirement: 35, // 35x wagering requirement
      validDays: 30         // Valid for 30 days
    },

    // Daily bonuses
    daily: {
      enabled: true,
      amounts: [10, 25, 50, 100, 250], // Random daily bonus amounts
      wageringRequirement: 20, // 20x wagering requirement
      maxConsecutive: 7      // Maximum 7 consecutive days
    },

    // Reload bonuses
    reload: {
      enabled: true,
      percentage: 0.50,     // 50% reload bonus
      maxAmount: 500,       // Maximum $500 bonus
      wageringRequirement: 25, // 25x wagering requirement
      cooldownHours: 24     // 24 hour cooldown
    }
  },

  // ============ AFFILIATE PROGRAM ============
  affiliate: {
    enabled: true,
    commission: {
      firstDeposit: 0.30,   // 30% of first deposit
      recurring: 0.10,      // 10% of recurring deposits
      lifetime: 0.05        // 5% lifetime commission
    },
    minimumPayout: 50,      // $50 minimum payout
    paymentMethods: ['BTC', 'ETH', 'USDT', 'USDC', 'BANK']
  },

  // ============ ADVERTISING REVENUE ============
  advertising: {
    enabled: true,
    // Banner ad revenue (per 1000 impressions)
    cpm: {
      banner: 2.00,         // $2.00 CPM
      video: 5.00,          // $5.00 CPM
      sponsored: 10.00      // $10.00 CPM for sponsored content
    },
    // Sponsored tournaments
    sponsoredTournaments: {
      enabled: true,
      basePrice: 1000,      // $1000 base price
      pricePerPlayer: 5     // $5 per additional player
    }
  },

  // ============ SUBSCRIPTION MODEL ============
  subscriptions: {
    enabled: true,
    plans: {
      basic: {
        name: 'Basic',
        price: 9.99,
        features: ['Ad-free experience', 'Exclusive games', 'Priority support']
      },
      premium: {
        name: 'Premium',
        price: 19.99,
        features: ['All Basic features', 'Higher betting limits', 'VIP tournaments', 'Personal manager']
      },
      vip: {
        name: 'VIP',
        price: 49.99,
        features: ['All Premium features', 'Custom games', 'Private tables', 'Exclusive events']
      }
    }
  },

  // ============ ANALYTICS & TRACKING ============
  analytics: {
    // Revenue tracking
    trackRevenue: true,
    trackUserLifetimeValue: true,
    trackGamePerformance: true,
    
    // Key metrics to monitor
    metrics: [
      'daily_revenue',
      'monthly_revenue',
      'user_acquisition_cost',
      'lifetime_value',
      'house_edge_performance',
      'crypto_transaction_volume'
    ]
  }
};
