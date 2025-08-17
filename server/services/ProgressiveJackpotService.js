// Progressive Jackpot System for Phase 8
class ProgressiveJackpotService {
  constructor() {
    this.jackpots = new Map();
    this.jackpotHistory = [];
    this.contributionRates = {
      'slots': 0.01,      // 1% of bet goes to jackpot
      'blackjack': 0.005, // 0.5% of bet goes to jackpot
      'roulette': 0.007,  // 0.7% of bet goes to jackpot
      'baccarat': 0.005,  // 0.5% of bet goes to jackpot
      'poker': 0.01,      // 1% of pot goes to jackpot
      'craps': 0.003      // 0.3% of bet goes to jackpot
    };
    
    this.jackpotTypes = {
      'mini': { min: 100, seed: 100, triggerOdds: 1000 },
      'minor': { min: 1000, seed: 1000, triggerOdds: 10000 },
      'major': { min: 10000, seed: 10000, triggerOdds: 100000 },
      'mega': { min: 100000, seed: 100000, triggerOdds: 1000000 }
    };

    this.initializeJackpots();
  }

  // Initialize all jackpot pools
  initializeJackpots() {
    Object.keys(this.contributionRates).forEach(gameType => {
      Object.keys(this.jackpotTypes).forEach(jackpotTier => {
        const jackpotId = `${gameType}_${jackpotTier}`;
        const config = this.jackpotTypes[jackpotTier];
        
        this.jackpots.set(jackpotId, {
          id: jackpotId,
          gameType,
          tier: jackpotTier,
          currentAmount: config.seed,
          seedAmount: config.seed,
          minimumAmount: config.min,
          triggerOdds: config.triggerOdds,
          lastWinner: null,
          lastWonAt: null,
          lastWonAmount: 0,
          totalContributions: 0,
          totalPayouts: 0,
          winCount: 0,
          contributionRate: this.contributionRates[gameType],
          isActive: true,
          createdAt: new Date(),
          lastUpdated: new Date(),
          recentWinners: [],
          statistics: {
            averageWinAmount: 0,
            averageTimeBetweenWins: 0,
            biggestWin: 0,
            totalWagers: 0,
            hitFrequency: 0
          }
        });
      });
    });

    // Create cross-game mega jackpot
    this.jackpots.set('mega_cross_game', {
      id: 'mega_cross_game',
      gameType: 'all',
      tier: 'mega',
      currentAmount: 500000,
      seedAmount: 500000,
      minimumAmount: 500000,
      triggerOdds: 5000000,
      lastWinner: null,
      lastWonAt: null,
      lastWonAmount: 0,
      totalContributions: 0,
      totalPayouts: 0,
      winCount: 0,
      contributionRate: 0.002, // 0.2% from all games
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date(),
      recentWinners: [],
      statistics: {
        averageWinAmount: 0,
        averageTimeBetweenWins: 0,
        biggestWin: 0,
        totalWagers: 0,
        hitFrequency: 0
      }
    });

    console.log('🎰 Progressive Jackpot System initialized with', this.jackpots.size, 'jackpots');
  }

  // Contribute to jackpots from a game bet
  contributeToBet(gameType, betAmount, playerId) {
    const contributions = [];
    const contributionRate = this.contributionRates[gameType] || 0.005;

    // Contribute to game-specific jackpots
    Object.values(this.jackpotTypes).forEach(config => {
      const jackpotId = `${gameType}_${config.tier}`;
      const jackpot = this.jackpots.get(jackpotId);
      
      if (jackpot && jackpot.isActive) {
        const contribution = betAmount * contributionRate * this.getTierMultiplier(config.tier);
        jackpot.currentAmount += contribution;
        jackpot.totalContributions += contribution;
        jackpot.statistics.totalWagers += betAmount;
        jackpot.lastUpdated = new Date();
        
        contributions.push({
          jackpotId,
          amount: contribution,
          tier: config.tier
        });
        
        this.jackpots.set(jackpotId, jackpot);
      }
    });

    // Contribute to cross-game mega jackpot
    const megaJackpot = this.jackpots.get('mega_cross_game');
    if (megaJackpot && megaJackpot.isActive) {
      const megaContribution = betAmount * megaJackpot.contributionRate;
      megaJackpot.currentAmount += megaContribution;
      megaJackpot.totalContributions += megaContribution;
      megaJackpot.statistics.totalWagers += betAmount;
      megaJackpot.lastUpdated = new Date();
      
      contributions.push({
        jackpotId: 'mega_cross_game',
        amount: megaContribution,
        tier: 'mega'
      });
      
      this.jackpots.set('mega_cross_game', megaJackpot);
    }

    return contributions;
  }

  // Get tier multiplier for contribution distribution
  getTierMultiplier(tier) {
    const multipliers = {
      'mini': 0.4,   // 40% of contribution rate
      'minor': 0.3,  // 30% of contribution rate
      'major': 0.2,  // 20% of contribution rate
      'mega': 0.1    // 10% of contribution rate
    };
    return multipliers[tier] || 0.25;
  }

  // Check for jackpot wins
  checkForJackpotWin(gameType, betAmount, gameResult, playerId, playerData) {
    const jackpotWins = [];

    // Check game-specific jackpots
    Object.keys(this.jackpotTypes).forEach(tier => {
      const jackpotId = `${gameType}_${tier}`;
      const jackpot = this.jackpots.get(jackpotId);
      
      if (jackpot && jackpot.isActive) {
        const winChance = this.calculateWinChance(jackpot, betAmount, gameResult);
        const randomRoll = Math.random() * jackpot.triggerOdds;
        
        if (randomRoll < winChance) {
          const winResult = this.triggerJackpotWin(jackpotId, playerId, playerData);
          jackpotWins.push(winResult);
        }
      }
    });

    // Check cross-game mega jackpot (lower chance)
    const megaJackpot = this.jackpots.get('mega_cross_game');
    if (megaJackpot && megaJackpot.isActive) {
      const megaWinChance = this.calculateWinChance(megaJackpot, betAmount, gameResult) * 0.1; // 10% of normal chance
      const randomRoll = Math.random() * megaJackpot.triggerOdds;
      
      if (randomRoll < megaWinChance) {
        const winResult = this.triggerJackpotWin('mega_cross_game', playerId, playerData);
        jackpotWins.push(winResult);
      }
    }

    return jackpotWins;
  }

  // Calculate win chance based on various factors
  calculateWinChance(jackpot, betAmount, gameResult) {
    let baseChance = 1; // Base chance of 1 in trigger odds
    
    // Increase chance based on bet amount (higher bets = better odds)
    const betMultiplier = Math.min(betAmount / 10, 5); // Max 5x multiplier
    baseChance *= (1 + betMultiplier * 0.1);
    
    // Increase chance if jackpot is very high
    const jackpotRatio = jackpot.currentAmount / jackpot.minimumAmount;
    if (jackpotRatio > 5) {
      baseChance *= (1 + Math.log(jackpotRatio) * 0.1);
    }
    
    // Special bonuses for certain game results
    if (gameResult) {
      if (gameResult.isSpecial || gameResult.isBonus) {
        baseChance *= 2; // Double chance for special results
      }
      if (gameResult.multiplier && gameResult.multiplier > 1) {
        baseChance *= (1 + gameResult.multiplier * 0.1);
      }
    }
    
    return Math.max(baseChance, 1);
  }

  // Trigger a jackpot win
  triggerJackpotWin(jackpotId, playerId, playerData) {
    const jackpot = this.jackpots.get(jackpotId);
    if (!jackpot) {
      throw new Error('Jackpot not found');
    }

    const winAmount = jackpot.currentAmount;
    const winData = {
      jackpotId,
      playerId,
      playerUsername: playerData.username,
      winAmount,
      gameType: jackpot.gameType,
      tier: jackpot.tier,
      wonAt: new Date(),
      jackpotSizeAtWin: winAmount,
      timeSinceLastWin: jackpot.lastWonAt ? Date.now() - jackpot.lastWonAt.getTime() : null
    };

    // Update jackpot
    jackpot.lastWinner = playerData;
    jackpot.lastWonAt = new Date();
    jackpot.lastWonAmount = winAmount;
    jackpot.totalPayouts += winAmount;
    jackpot.winCount++;
    jackpot.currentAmount = jackpot.seedAmount; // Reset to seed amount
    jackpot.lastUpdated = new Date();

    // Update statistics
    jackpot.statistics.averageWinAmount = jackpot.totalPayouts / jackpot.winCount;
    if (winAmount > jackpot.statistics.biggestWin) {
      jackpot.statistics.biggestWin = winAmount;
    }
    if (jackpot.winCount > 1) {
      const totalTime = Date.now() - jackpot.createdAt.getTime();
      jackpot.statistics.averageTimeBetweenWins = totalTime / (jackpot.winCount - 1);
    }
    jackpot.statistics.hitFrequency = jackpot.winCount / (jackpot.statistics.totalWagers / 1000); // Hits per 1000 wagers

    // Add to recent winners (keep last 10)
    jackpot.recentWinners.unshift({
      playerId,
      username: playerData.username,
      amount: winAmount,
      wonAt: new Date()
    });
    if (jackpot.recentWinners.length > 10) {
      jackpot.recentWinners = jackpot.recentWinners.slice(0, 10);
    }

    this.jackpots.set(jackpotId, jackpot);

    // Add to history
    this.jackpotHistory.unshift(winData);
    if (this.jackpotHistory.length > 1000) {
      this.jackpotHistory = this.jackpotHistory.slice(0, 1000);
    }

    console.log(`🎉 JACKPOT WIN! ${playerData.username} won $${winAmount.toFixed(2)} on ${jackpotId}`);

    return {
      ...winData,
      success: true,
      message: `Congratulations! You won the ${jackpot.tier} jackpot!`
    };
  }

  // Get all active jackpots
  getAllJackpots() {
    return Array.from(this.jackpots.values())
      .filter(j => j.isActive)
      .map(j => ({
        id: j.id,
        gameType: j.gameType,
        tier: j.tier,
        currentAmount: Math.round(j.currentAmount * 100) / 100, // Round to 2 decimals
        lastWinner: j.lastWinner ? {
          username: j.lastWinner.username,
          wonAt: j.lastWonAt,
          amount: j.lastWonAmount
        } : null,
        statistics: {
          ...j.statistics,
          averageWinAmount: Math.round(j.statistics.averageWinAmount * 100) / 100,
          biggestWin: Math.round(j.statistics.biggestWin * 100) / 100,
          hitFrequency: Math.round(j.statistics.hitFrequency * 10000) / 10000
        }
      }))
      .sort((a, b) => b.currentAmount - a.currentAmount);
  }

  // Get jackpots for specific game
  getGameJackpots(gameType) {
    return Array.from(this.jackpots.values())
      .filter(j => j.isActive && (j.gameType === gameType || j.gameType === 'all'))
      .map(j => ({
        id: j.id,
        tier: j.tier,
        currentAmount: Math.round(j.currentAmount * 100) / 100,
        triggerOdds: j.triggerOdds,
        contributionRate: j.contributionRate
      }))
      .sort((a, b) => b.currentAmount - a.currentAmount);
  }

  // Get jackpot history
  getJackpotHistory(limit = 50) {
    return this.jackpotHistory
      .slice(0, limit)
      .map(entry => ({
        ...entry,
        winAmount: Math.round(entry.winAmount * 100) / 100
      }));
  }

  // Get jackpot statistics
  getJackpotStatistics() {
    const allJackpots = Array.from(this.jackpots.values());
    const totalCurrentValue = allJackpots.reduce((sum, j) => sum + j.currentAmount, 0);
    const totalPayouts = allJackpots.reduce((sum, j) => sum + j.totalPayouts, 0);
    const totalContributions = allJackpots.reduce((sum, j) => sum + j.totalContributions, 0);
    const totalWins = allJackpots.reduce((sum, j) => sum + j.winCount, 0);

    const biggestWin = this.jackpotHistory.length > 0 
      ? Math.max(...this.jackpotHistory.map(h => h.winAmount))
      : 0;

    const recentWins = this.jackpotHistory.slice(0, 24); // Last 24 hours worth

    return {
      overview: {
        totalJackpots: allJackpots.length,
        totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
        totalPayouts: Math.round(totalPayouts * 100) / 100,
        totalContributions: Math.round(totalContributions * 100) / 100,
        totalWins,
        biggestWin: Math.round(biggestWin * 100) / 100,
        averageWin: totalWins > 0 ? Math.round((totalPayouts / totalWins) * 100) / 100 : 0
      },
      byTier: Object.keys(this.jackpotTypes).map(tier => {
        const tierJackpots = allJackpots.filter(j => j.tier === tier);
        const tierTotal = tierJackpots.reduce((sum, j) => sum + j.currentAmount, 0);
        const tierWins = tierJackpots.reduce((sum, j) => sum + j.winCount, 0);
        const tierPayouts = tierJackpots.reduce((sum, j) => sum + j.totalPayouts, 0);
        
        return {
          tier,
          count: tierJackpots.length,
          totalValue: Math.round(tierTotal * 100) / 100,
          totalWins: tierWins,
          totalPayouts: Math.round(tierPayouts * 100) / 100,
          averageValue: tierJackpots.length > 0 
            ? Math.round((tierTotal / tierJackpots.length) * 100) / 100 
            : 0
        };
      }),
      recentActivity: recentWins.map(win => ({
        ...win,
        winAmount: Math.round(win.winAmount * 100) / 100
      }))
    };
  }

  // Manually seed a jackpot (admin function)
  seedJackpot(jackpotId, additionalAmount) {
    const jackpot = this.jackpots.get(jackpotId);
    if (!jackpot) {
      throw new Error('Jackpot not found');
    }

    jackpot.currentAmount += additionalAmount;
    jackpot.lastUpdated = new Date();
    this.jackpots.set(jackpotId, jackpot);

    console.log(`💰 Jackpot ${jackpotId} seeded with $${additionalAmount}`);

    return {
      success: true,
      jackpotId,
      newAmount: jackpot.currentAmount,
      seedAmount: additionalAmount
    };
  }

  // Get top jackpots (highest amounts)
  getTopJackpots(limit = 10) {
    return Array.from(this.jackpots.values())
      .filter(j => j.isActive)
      .sort((a, b) => b.currentAmount - a.currentAmount)
      .slice(0, limit)
      .map(j => ({
        id: j.id,
        gameType: j.gameType,
        tier: j.tier,
        currentAmount: Math.round(j.currentAmount * 100) / 100,
        lastWinner: j.lastWinner?.username || 'None yet',
        daysSinceLastWin: j.lastWonAt 
          ? Math.floor((Date.now() - j.lastWonAt.getTime()) / (1000 * 60 * 60 * 24))
          : 'Never'
      }));
  }

  // Check if any jackpots need maintenance
  performMaintenance() {
    const maintenanceResults = [];
    
    this.jackpots.forEach((jackpot, id) => {
      // Reset jackpots that are too high (anti-accumulation)
      const maxAmount = jackpot.minimumAmount * 100; // 100x minimum
      if (jackpot.currentAmount > maxAmount) {
        const excess = jackpot.currentAmount - maxAmount;
        jackpot.currentAmount = maxAmount;
        maintenanceResults.push({
          type: 'excess_removed',
          jackpotId: id,
          excessAmount: excess
        });
      }

      // Boost jackpots that haven't been won in a long time
      const daysSinceLastWin = jackpot.lastWonAt 
        ? (Date.now() - jackpot.lastWonAt.getTime()) / (1000 * 60 * 60 * 24)
        : 30;
        
      if (daysSinceLastWin > 30 && jackpot.currentAmount < jackpot.minimumAmount * 2) {
        const boost = jackpot.minimumAmount * 0.1; // 10% boost
        jackpot.currentAmount += boost;
        maintenanceResults.push({
          type: 'boost_applied',
          jackpotId: id,
          boostAmount: boost,
          reason: 'Long time since last win'
        });
      }

      this.jackpots.set(id, jackpot);
    });

    if (maintenanceResults.length > 0) {
      console.log('🔧 Jackpot maintenance completed:', maintenanceResults.length, 'actions taken');
    }

    return maintenanceResults;
  }
}

module.exports = ProgressiveJackpotService;
