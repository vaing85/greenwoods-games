const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Game state storage (in production, use Redis or database)
const gameStates = {
  baccarat: new Map(),
  craps: new Map(),
  videoPoker: new Map()
};

// Baccarat Routes
router.post('/baccarat/bet', authenticateToken, async (req, res) => {
  try {
    const { betType, amount } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Initialize game state if not exists
    if (!gameStates.baccarat.has(userId)) {
      gameStates.baccarat.set(userId, {
        phase: 'betting',
        playerCards: [],
        bankerCards: [],
        playerTotal: 0,
        bankerTotal: 0,
        winner: null,
        bets: { player: 0, banker: 0, tie: 0 },
        gameHistory: []
      });
    }

    const gameState = gameStates.baccarat.get(userId);
    
    if (gameState.phase !== 'betting') {
      return res.status(400).json({ error: 'Not in betting phase' });
    }

    // Place bet
    gameState.bets[betType] += amount;
    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      gameState,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/baccarat/deal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gameState = gameStates.baccarat.get(userId);
    
    if (!gameState || gameState.phase !== 'betting') {
      return res.status(400).json({ error: 'Invalid game state' });
    }

    // Deal cards
    const deck = generateDeck();
    shuffleDeck(deck);
    
    gameState.playerCards = [deck.pop(), deck.pop()];
    gameState.bankerCards = [deck.pop(), deck.pop()];
    
    gameState.playerTotal = calculateBaccaratTotal(gameState.playerCards);
    gameState.bankerTotal = calculateBaccaratTotal(gameState.bankerCards);
    
    // Apply third card rules
    const { playerCards, bankerCards } = applyBaccaratRules(
      gameState.playerCards, 
      gameState.bankerCards, 
      deck
    );
    
    gameState.playerCards = playerCards;
    gameState.bankerCards = bankerCards;
    gameState.playerTotal = calculateBaccaratTotal(playerCards);
    gameState.bankerTotal = calculateBaccaratTotal(bankerCards);
    
    // Determine winner
    if (gameState.playerTotal > gameState.bankerTotal) {
      gameState.winner = 'player';
    } else if (gameState.bankerTotal > gameState.playerTotal) {
      gameState.winner = 'banker';
    } else {
      gameState.winner = 'tie';
    }
    
    gameState.phase = 'ended';
    
    // Calculate winnings
    const user = await User.findById(userId);
    let winnings = 0;
    
    if (gameState.winner === 'player' && gameState.bets.player > 0) {
      winnings += gameState.bets.player * 2; // 1:1 payout
    }
    if (gameState.winner === 'banker' && gameState.bets.banker > 0) {
      winnings += Math.floor(gameState.bets.banker * 1.95); // 1:1 minus 5% commission
    }
    if (gameState.winner === 'tie' && gameState.bets.tie > 0) {
      winnings += gameState.bets.tie * 9; // 8:1 payout
    }
    
    user.balance += winnings;
    await user.save();
    
    // Add to history
    gameState.gameHistory.push({
      winner: gameState.winner,
      playerTotal: gameState.playerTotal,
      bankerTotal: gameState.bankerTotal
    });
    
    res.json({
      success: true,
      gameState,
      balance: user.balance,
      winnings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Craps Routes
router.post('/craps/bet', authenticateToken, async (req, res) => {
  try {
    const { betType, amount } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Initialize game state if not exists
    if (!gameStates.craps.has(userId)) {
      gameStates.craps.set(userId, {
        phase: 'comeout',
        point: null,
        lastRoll: [],
        rollHistory: [],
        bets: {},
        totalBet: 0
      });
    }

    const gameState = gameStates.craps.get(userId);
    
    // Place bet
    if (!gameState.bets[betType]) {
      gameState.bets[betType] = 0;
    }
    gameState.bets[betType] += amount;
    gameState.totalBet += amount;
    
    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      gameState,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/craps/roll', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gameState = gameStates.craps.get(userId);
    
    if (!gameState || gameState.totalBet === 0) {
      return res.status(400).json({ error: 'No bets placed' });
    }

    // Roll dice
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    
    gameState.lastRoll = [die1, die2];
    gameState.rollHistory.push({ dice: [die1, die2], total });
    
    // Evaluate bets
    const user = await User.findById(userId);
    let winnings = 0;
    
    // Process different bet types
    winnings += processCrapsBets(gameState, total, user);
    
    user.balance += winnings;
    await user.save();
    
    res.json({
      success: true,
      gameState,
      balance: user.balance,
      winnings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video Poker Routes
router.post('/video-poker/bet', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Initialize game state if not exists
    if (!gameStates.videoPoker.has(userId)) {
      gameStates.videoPoker.set(userId, {
        phase: 'betting',
        hand: [],
        held: [false, false, false, false, false],
        bet: 0,
        credits: 0,
        lastWin: null
      });
    }

    const gameState = gameStates.videoPoker.get(userId);
    gameState.bet = amount;
    gameState.credits = amount;
    
    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      gameState,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/video-poker/deal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const gameState = gameStates.videoPoker.get(userId);
    
    if (!gameState || gameState.bet === 0) {
      return res.status(400).json({ error: 'No bet placed' });
    }

    // Deal 5 cards
    const deck = generateDeck();
    shuffleDeck(deck);
    gameState.hand = deck.splice(0, 5);
    gameState.held = [false, false, false, false, false];
    gameState.phase = 'draw';

    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function generateDeck() {
  const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (let suit of suits) {
    for (let value of values) {
      deck.push(`${value} of ${suit}`);
    }
  }
  
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function calculateBaccaratTotal(cards) {
  let total = 0;
  for (let card of cards) {
    const value = card.split(' ')[0];
    if (['J', 'Q', 'K'].includes(value)) {
      total += 0;
    } else if (value === 'A') {
      total += 1;
    } else {
      total += parseInt(value);
    }
  }
  return total % 10;
}

function applyBaccaratRules(playerCards, bankerCards, deck) {
  let playerTotal = calculateBaccaratTotal(playerCards);
  let bankerTotal = calculateBaccaratTotal(bankerCards);
  let playerThirdCard = null;
  
  // Player third card rule
  if (playerTotal <= 5) {
    playerThirdCard = deck.pop();
    playerCards.push(playerThirdCard);
    playerTotal = calculateBaccaratTotal(playerCards);
  }
  
  // Banker third card rule (simplified)
  if (bankerTotal <= 5 && !playerThirdCard) {
    bankerCards.push(deck.pop());
  } else if (bankerTotal <= 2) {
    bankerCards.push(deck.pop());
  }
  
  return { playerCards, bankerCards };
}

function processCrapsBets(gameState, total, user) {
  let winnings = 0;
  const bets = gameState.bets;
  
  // Process each bet type
  Object.keys(bets).forEach(betType => {
    const betAmount = bets[betType];
    if (betAmount === 0) return;
    
    let won = false;
    let payout = 1;
    
    switch (betType) {
      case 'pass':
        if (gameState.phase === 'comeout') {
          won = [7, 11].includes(total);
        } else {
          won = total === gameState.point;
        }
        break;
      case 'field':
        won = [2, 3, 4, 9, 10, 11, 12].includes(total);
        payout = [2, 12].includes(total) ? 2 : 1;
        break;
      case 'any7':
        won = total === 7;
        payout = 4;
        break;
      case 'anycraps':
        won = [2, 3, 12].includes(total);
        payout = 7;
        break;
    }
    
    if (won) {
      winnings += betAmount * (payout + 1);
    }
  });
  
  // Reset bets after evaluation
  gameState.bets = {};
  gameState.totalBet = 0;
  
  return winnings;
}

module.exports = router;
