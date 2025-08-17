const express = require('express');
const router = express.Router();
const CryptoService = require('../services/CryptoService');
const AIGamingService = require('../services/AIGamingService');
const TournamentService = require('../services/TournamentService');
const ProgressiveJackpotService = require('../services/ProgressiveJackpotService');

// Initialize services
const cryptoService = new CryptoService();
const aiGamingService = new AIGamingService();
const tournamentService = new TournamentService();
const jackpotService = new ProgressiveJackpotService();

// Initialize AI model
aiGamingService.initializeModel();

// ============ CRYPTOCURRENCY ROUTES ============

// Get current crypto prices
router.get('/crypto/prices', async (req, res) => {
  try {
    const prices = await cryptoService.getCryptoPrices();
    res.json({
      success: true,
      prices,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate crypto address
router.post('/crypto/validate-address', (req, res) => {
  try {
    const { address, currency } = req.body;
    
    let isValid = false;
    if (currency === 'BTC') {
      isValid = cryptoService.validateBitcoinAddress(address);
    } else if (currency === 'ETH') {
      isValid = cryptoService.validateEthereumAddress(address);
    }
    
    res.json({
      success: true,
      isValid,
      currency,
      address
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get crypto balance
router.get('/crypto/balance/:currency/:address', async (req, res) => {
  try {
    const { currency, address } = req.params;
    
    let balance;
    if (currency === 'BTC') {
      balance = await cryptoService.getBitcoinBalance(address);
    } else if (currency === 'ETH') {
      balance = await cryptoService.getEthereumBalance(address);
    } else {
      throw new Error('Unsupported currency');
    }
    
    res.json({
      success: true,
      currency,
      address,
      balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate deposit address
router.post('/crypto/generate-address', (req, res) => {
  try {
    const { currency } = req.body;
    const addressData = cryptoService.generateDepositAddress(currency);
    
    // In production, store the private key securely and return only the address
    res.json({
      success: true,
      address: addressData.address,
      currency: addressData.currency
      // privateKey should NOT be returned in production!
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate transaction fees
router.get('/crypto/fees/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const fees = await cryptoService.estimateTransactionFee(currency);
    
    res.json({
      success: true,
      currency,
      fees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create withdrawal request
router.post('/crypto/withdraw', async (req, res) => {
  try {
    const { userId, address, amount, currency } = req.body;
    const withdrawal = await cryptoService.createWithdrawal(userId, address, amount, currency);
    
    res.json({
      success: true,
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AI GAMING ROUTES ============

// Get betting recommendation
router.post('/ai/recommendation', async (req, res) => {
  try {
    const { userId, currentGame, currentBalance } = req.body;
    const recommendation = await aiGamingService.generateBettingRecommendation(
      userId, 
      currentGame, 
      currentBalance
    );
    
    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track user behavior
router.post('/ai/track-behavior', (req, res) => {
  try {
    const { userId, gameAction } = req.body;
    aiGamingService.trackUserBehavior(userId, gameAction);
    
    res.json({
      success: true,
      message: 'Behavior tracked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for fraudulent activity
router.post('/ai/fraud-check', (req, res) => {
  try {
    const { userId, gameAction } = req.body;
    const fraudCheck = aiGamingService.detectFraudulentActivity(userId, gameAction);
    
    res.json({
      success: true,
      fraudCheck
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game recommendations
router.get('/ai/game-recommendations/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = aiGamingService.getGameRecommendations(userId);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user insights
router.get('/ai/insights/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const insights = aiGamingService.generateUserInsights(userId);
    
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TOURNAMENT ROUTES ============

// Get all tournaments
router.get('/tournaments', (req, res) => {
  try {
    const { status } = req.query;
    const tournaments = status 
      ? tournamentService.getTournamentsByStatus(status)
      : tournamentService.getAllTournaments();
    
    res.json({
      success: true,
      tournaments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tournament
router.post('/tournaments', (req, res) => {
  try {
    const tournament = tournamentService.createTournament(req.body);
    res.json({
      success: true,
      tournament
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for tournament
router.post('/tournaments/:tournamentId/register', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { playerId, playerData } = req.body;
    
    const result = await tournamentService.registerPlayer(tournamentId, playerId, playerData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start tournament
router.post('/tournaments/:tournamentId/start', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const result = await tournamentService.startTournament(tournamentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advance tournament match
router.post('/tournaments/:tournamentId/advance', (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { matchId, winnerId, matchData } = req.body;
    
    const result = tournamentService.advanceMatch(tournamentId, matchId, winnerId, matchData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tournament leaderboard
router.get('/tournaments/:tournamentId/leaderboard', (req, res) => {
  try {
    const { tournamentId } = req.params;
    const leaderboard = tournamentService.getTournamentLeaderboard(tournamentId);
    
    if (!leaderboard) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel tournament
router.post('/tournaments/:tournamentId/cancel', (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { reason } = req.body;
    
    const result = tournamentService.cancelTournament(tournamentId, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROGRESSIVE JACKPOT ROUTES ============

// Get all jackpots
router.get('/jackpots', (req, res) => {
  try {
    const jackpots = jackpotService.getAllJackpots();
    res.json({
      success: true,
      jackpots
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jackpots for specific game
router.get('/jackpots/game/:gameType', (req, res) => {
  try {
    const { gameType } = req.params;
    const jackpots = jackpotService.getGameJackpots(gameType);
    
    res.json({
      success: true,
      gameType,
      jackpots
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contribute to jackpots (called when player places bet)
router.post('/jackpots/contribute', (req, res) => {
  try {
    const { gameType, betAmount, playerId } = req.body;
    const contributions = jackpotService.contributeToBet(gameType, betAmount, playerId);
    
    res.json({
      success: true,
      contributions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for jackpot wins (called after game completes)
router.post('/jackpots/check-win', (req, res) => {
  try {
    const { gameType, betAmount, gameResult, playerId, playerData } = req.body;
    const jackpotWins = jackpotService.checkForJackpotWin(
      gameType, 
      betAmount, 
      gameResult, 
      playerId, 
      playerData
    );
    
    res.json({
      success: true,
      jackpotWins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jackpot history
router.get('/jackpots/history', (req, res) => {
  try {
    const { limit } = req.query;
    const history = jackpotService.getJackpotHistory(parseInt(limit) || 50);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jackpot statistics
router.get('/jackpots/statistics', (req, res) => {
  try {
    const statistics = jackpotService.getJackpotStatistics();
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top jackpots
router.get('/jackpots/top', (req, res) => {
  try {
    const { limit } = req.query;
    const topJackpots = jackpotService.getTopJackpots(parseInt(limit) || 10);
    
    res.json({
      success: true,
      topJackpots
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Seed jackpot (requires admin privileges)
router.post('/jackpots/:jackpotId/seed', (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const { jackpotId } = req.params;
    const { amount } = req.body;
    
    const result = jackpotService.seedJackpot(jackpotId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PHASE 8 OVERVIEW ROUTE ============

router.get('/overview', async (req, res) => {
  try {
    const overview = {
      phase: 8,
      title: 'Advanced Gaming Features',
      features: {
        cryptocurrency: {
          enabled: true,
          supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'],
          prices: await cryptoService.getCryptoPrices()
        },
        aiGaming: {
          enabled: true,
          features: ['betting_recommendations', 'fraud_detection', 'game_suggestions', 'user_insights']
        },
        tournaments: {
          enabled: true,
          active: tournamentService.getTournamentsByStatus('active').length,
          registering: tournamentService.getTournamentsByStatus('registration').length,
          types: ['elimination', 'double_elimination', 'round_robin', 'swiss']
        },
        progressiveJackpots: {
          enabled: true,
          totalValue: jackpotService.getAllJackpots().reduce((sum, j) => sum + j.currentAmount, 0),
          topJackpots: jackpotService.getTopJackpots(5),
          recentWinners: jackpotService.getJackpotHistory(5)
        }
      },
      statistics: {
        totalServices: 4,
        implementationDate: new Date(),
        version: '8.0.0'
      }
    };

    res.json({
      success: true,
      overview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
