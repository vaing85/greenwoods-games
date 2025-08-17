// AI-Powered Gaming Service for Phase 8 - Rule-based implementation
class AIGamingService {
  constructor() {
    this.userBehaviorData = new Map();
    this.fraudDetectionThresholds = {
      maxBetIncrease: 10, // 10x bet increase is suspicious
      maxWinStreak: 15,   // 15 wins in a row is suspicious
      maxSessionDuration: 12 * 60 * 60 * 1000, // 12 hours
      suspiciousPatterns: 5 // Number of patterns to trigger alert
    };
  }

  // Initialize AI service with rule-based algorithms
  async initializeModel() {
    try {
      console.log('🤖 AI Gaming Service initialized with rule-based algorithms');
      return true;
    } catch (error) {
      console.error('Error initializing AI service:', error.message);
      return false;
    }
  }

  // Track user behavior for AI analysis
  trackUserBehavior(userId, gameAction) {
    const {
      gameId,
      betAmount,
      gameResult,
      sessionDuration,
      winAmount,
      previousBalance,
      currentBalance
    } = gameAction;

    if (!this.userBehaviorData.has(userId)) {
      this.userBehaviorData.set(userId, {
        totalGames: 0,
        totalBets: 0,
        totalWins: 0,
        totalLosses: 0,
        averageBet: 0,
        winStreak: 0,
        lossStreak: 0,
        favoriteGames: new Map(),
        sessionTimes: [],
        bettingPatterns: [],
        lastActivity: new Date(),
        riskScore: 0
      });
    }

    const userData = this.userBehaviorData.get(userId);
    
    // Update statistics
    userData.totalGames++;
    userData.totalBets += betAmount;
    userData.averageBet = userData.totalBets / userData.totalGames;
    userData.lastActivity = new Date();

    // Track game results
    if (gameResult === 'win') {
      userData.totalWins++;
      userData.winStreak++;
      userData.lossStreak = 0;
    } else {
      userData.totalLosses++;
      userData.lossStreak++;
      userData.winStreak = 0;
    }

    // Track favorite games
    const gameCount = userData.favoriteGames.get(gameId) || 0;
    userData.favoriteGames.set(gameId, gameCount + 1);

    // Track session times
    userData.sessionTimes.push(sessionDuration);

    // Track betting patterns
    userData.bettingPatterns.push({
      amount: betAmount,
      timestamp: new Date(),
      result: gameResult,
      balanceChange: currentBalance - previousBalance
    });

    // Keep only last 100 patterns
    if (userData.bettingPatterns.length > 100) {
      userData.bettingPatterns = userData.bettingPatterns.slice(-100);
    }

    this.userBehaviorData.set(userId, userData);
  }

  // Generate smart betting recommendations
  async generateBettingRecommendation(userId, currentGame, currentBalance) {
    try {
      const userData = this.userBehaviorData.get(userId);
      if (!userData || userData.totalGames < 10) {
        return {
          recommendation: 'conservative',
          suggestedBet: Math.min(currentBalance * 0.02, 10), // 2% of balance, max $10
          confidence: 0.5,
          reason: 'Insufficient data for personalized recommendation. Starting with conservative approach.'
        };
      }

      // Prepare input features for analysis
      const features = this.prepareFeatures(userData, currentGame, currentBalance);
      
      // Use rule-based recommendation system
      return this.generateRuleBasedRecommendation(userData, currentBalance, features);
    } catch (error) {
      console.error('Error generating betting recommendation:', error.message);
      return {
        recommendation: 'conservative',
        suggestedBet: Math.min(currentBalance * 0.02, 10),
        confidence: 0.5,
        reason: 'Error in AI analysis. Defaulting to conservative approach.'
      };
    }
  }

  // Prepare features for AI model
  prepareFeatures(userData, currentGame, currentBalance) {
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    const averageSessionTime = userData.sessionTimes.reduce((a, b) => a + b, 0) / userData.sessionTimes.length || 0;
    const balanceRatio = currentBalance / (userData.averageBet * 20); // 20 bets worth
    const recentPerformance = this.calculateRecentPerformance(userData);
    const gameExperience = userData.favoriteGames.get(currentGame) || 0;
    
    return [
      winRate,
      userData.averageBet / currentBalance, // Bet to balance ratio
      userData.winStreak / 10, // Normalized win streak
      userData.lossStreak / 10, // Normalized loss streak
      balanceRatio,
      recentPerformance,
      gameExperience / userData.totalGames, // Game familiarity
      averageSessionTime / (60 * 60 * 1000) // Session time in hours
    ];
  }

  // Calculate recent performance (last 20 games)
  calculateRecentPerformance(userData) {
    const recentGames = userData.bettingPatterns.slice(-20);
    if (recentGames.length === 0) return 0;
    
    const recentWins = recentGames.filter(game => game.result === 'win').length;
    return recentWins / recentGames.length;
  }

  // Calculate suggested bet amount based on strategy
  calculateSuggestedBet(strategy, userData, currentBalance) {
    const baseMultipliers = {
      'conservative': 0.02,  // 2% of balance
      'moderate': 0.05,      // 5% of balance
      'aggressive': 0.1,     // 10% of balance
      'high-risk': 0.2       // 20% of balance
    };

    const baseAmount = currentBalance * baseMultipliers[strategy];
    
    // Adjust based on user patterns
    const avgBetRatio = userData.averageBet / currentBalance;
    const adjustment = Math.min(avgBetRatio * 2, 0.5); // Max 50% adjustment
    
    return Math.max(1, Math.min(baseAmount * (1 + adjustment), currentBalance * 0.25));
  }

  // Generate reason for recommendation
  generateRecommendationReason(strategy, userData) {
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    const reasons = {
      'conservative': `Based on your ${(winRate * 100).toFixed(1)}% win rate and current streak patterns, a conservative approach is recommended to preserve your bankroll.`,
      'moderate': `Your consistent performance (${(winRate * 100).toFixed(1)}% win rate) suggests a balanced moderate betting strategy.`,
      'aggressive': `Your strong recent performance and favorable patterns indicate you could benefit from more aggressive betting.`,
      'high-risk': `Your exceptional win streak and betting patterns suggest you're in a hot streak - consider higher risk for maximum potential returns.`
    };
    
    return reasons[strategy] || 'Recommendation based on AI analysis of your gaming patterns.';
  }

  // Rule-based fallback recommendation
  generateRuleBasedRecommendation(userData, currentBalance, features = null) {
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    
    let strategy = 'conservative';
    if (winRate > 0.6 && userData.winStreak > 3) {
      strategy = 'aggressive';
    } else if (winRate > 0.5) {
      strategy = 'moderate';
    }
    
    return {
      recommendation: strategy,
      suggestedBet: this.calculateSuggestedBet(strategy, userData, currentBalance),
      confidence: 0.7,
      reason: this.generateRecommendationReason(strategy, userData)
    };
  }

  // Fraud detection system
  detectFraudulentActivity(userId, gameAction) {
    const userData = this.userBehaviorData.get(userId);
    if (!userData) return { isFraudulent: false, riskScore: 0 };

    let riskScore = 0;
    const alerts = [];

    // Check for sudden bet amount increases
    if (userData.bettingPatterns.length > 0) {
      const lastBet = userData.bettingPatterns[userData.bettingPatterns.length - 1];
      const betIncrease = gameAction.betAmount / lastBet.amount;
      
      if (betIncrease > this.fraudDetectionThresholds.maxBetIncrease) {
        riskScore += 30;
        alerts.push(`Suspicious bet increase: ${betIncrease.toFixed(1)}x previous bet`);
      }
    }

    // Check for unusual win streaks
    if (userData.winStreak > this.fraudDetectionThresholds.maxWinStreak) {
      riskScore += 40;
      alerts.push(`Unusual win streak: ${userData.winStreak} consecutive wins`);
    }

    // Check for unusually long sessions
    const sessionTime = gameAction.sessionDuration;
    if (sessionTime > this.fraudDetectionThresholds.maxSessionDuration) {
      riskScore += 20;
      alerts.push(`Unusually long session: ${(sessionTime / (60 * 60 * 1000)).toFixed(1)} hours`);
    }

    // Check for repetitive betting patterns
    const patternScore = this.detectRepetitivePatterns(userData.bettingPatterns);
    if (patternScore > 0.8) {
      riskScore += 25;
      alerts.push('Highly repetitive betting patterns detected');
    }

    // Check for impossible win rates (over extended periods)
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    if (userData.totalGames > 100 && winRate > 0.85) {
      riskScore += 35;
      alerts.push(`Statistically improbable win rate: ${(winRate * 100).toFixed(1)}%`);
    }

    userData.riskScore = riskScore;
    this.userBehaviorData.set(userId, userData);

    return {
      isFraudulent: riskScore > 50,
      riskScore,
      alerts,
      recommendation: riskScore > 30 ? 'manual_review' : riskScore > 15 ? 'enhanced_monitoring' : 'normal'
    };
  }

  // Detect repetitive patterns in betting
  detectRepetitivePatterns(bettingPatterns) {
    if (bettingPatterns.length < 10) return 0;

    const recent = bettingPatterns.slice(-20);
    const amounts = recent.map(p => p.amount);
    
    // Check for exact amount repetition
    const uniqueAmounts = new Set(amounts);
    const repetitionScore = 1 - (uniqueAmounts.size / amounts.length);
    
    return repetitionScore;
  }

  // Get personalized game recommendations
  getGameRecommendations(userId) {
    const userData = this.userBehaviorData.get(userId);
    if (!userData) {
      return {
        recommended: ['slots', 'blackjack', 'roulette'],
        reason: 'Popular games for new players'
      };
    }

    // Sort games by play frequency and win rate
    const gameStats = Array.from(userData.favoriteGames.entries()).map(([gameId, count]) => {
      const gamePatterns = userData.bettingPatterns.filter(p => p.gameId === gameId);
      const winRate = gamePatterns.filter(p => p.result === 'win').length / gamePatterns.length || 0;
      
      return {
        gameId,
        playCount: count,
        winRate,
        score: count * 0.6 + winRate * 0.4 // Weighted score
      };
    }).sort((a, b) => b.score - a.score);

    const recommended = gameStats.slice(0, 3).map(g => g.gameId);
    
    return {
      recommended: recommended.length > 0 ? recommended : ['slots', 'blackjack', 'roulette'],
      reason: recommended.length > 0 
        ? 'Based on your playing history and success rates'
        : 'Popular games to get started',
      gameStats: gameStats.slice(0, 5)
    };
  }

  // Generate AI insights for user dashboard
  generateUserInsights(userId) {
    const userData = this.userBehaviorData.get(userId);
    if (!userData) return null;

    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    const totalPlayed = userData.totalWins + userData.totalLosses;
    const avgSessionTime = userData.sessionTimes.reduce((a, b) => a + b, 0) / userData.sessionTimes.length || 0;

    return {
      performance: {
        winRate: (winRate * 100).toFixed(1),
        totalGames: totalPlayed,
        currentStreak: userData.winStreak > userData.lossStreak ? 
          `${userData.winStreak} wins` : `${userData.lossStreak} losses`,
        averageBet: userData.averageBet.toFixed(2)
      },
      patterns: {
        favoriteGame: this.getFavoriteGame(userData),
        averageSessionTime: (avgSessionTime / (60 * 1000)).toFixed(0) + ' minutes',
        playingStyle: this.determinePlayingStyle(userData),
        riskLevel: this.calculateRiskLevel(userData)
      },
      recommendations: {
        nextAction: this.getNextActionRecommendation(userData),
        improvementTips: this.getImprovementTips(userData)
      }
    };
  }

  // Helper methods for insights
  getFavoriteGame(userData) {
    let maxCount = 0;
    let favoriteGame = 'slots';
    
    userData.favoriteGames.forEach((count, gameId) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = gameId;
      }
    });
    
    return favoriteGame;
  }

  determinePlayingStyle(userData) {
    const avgBetToBalance = userData.averageBet / (userData.totalBets / userData.totalGames);
    
    if (avgBetToBalance > 0.1) return 'High Roller';
    if (avgBetToBalance > 0.05) return 'Aggressive';
    if (avgBetToBalance > 0.02) return 'Moderate';
    return 'Conservative';
  }

  calculateRiskLevel(userData) {
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    const streakRisk = Math.max(userData.winStreak, userData.lossStreak) / 10;
    
    if (winRate > 0.6 && streakRisk < 0.5) return 'Low';
    if (winRate > 0.4 && streakRisk < 1) return 'Medium';
    return 'High';
  }

  getNextActionRecommendation(userData) {
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    
    if (userData.lossStreak > 5) return 'Take a break and return with a clear mind';
    if (userData.winStreak > 10) return 'Consider securing profits and playing conservatively';
    if (winRate < 0.3) return 'Try different games or lower your bet amounts';
    return 'Continue with your current strategy';
  }

  getImprovementTips(userData) {
    const tips = [];
    const winRate = userData.totalWins / (userData.totalWins + userData.totalLosses);
    
    if (winRate < 0.4) {
      tips.push('Consider learning basic strategies for table games');
    }
    if (userData.averageBet > userData.totalBets / userData.totalGames * 0.1) {
      tips.push('Try reducing bet sizes to extend playing time');
    }
    if (userData.favoriteGames.size < 3) {
      tips.push('Explore different game types to find your strengths');
    }
    
    return tips.length > 0 ? tips : ['Keep playing responsibly and enjoy the games!'];
  }
}

module.exports = AIGamingService;
