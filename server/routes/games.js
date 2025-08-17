const express = require('express');
const router = express.Router();

// Mock game data
const games = {
  slots: [
    { id: 'classic-slots', name: 'Classic Slots', minBet: 1, maxBet: 100 },
    { id: 'fruit-machine', name: 'Fruit Machine', minBet: 5, maxBet: 500 },
    { id: 'diamond-slots', name: 'Diamond Slots', minBet: 10, maxBet: 1000 }
  ],
  table: [
    { id: 'blackjack', name: 'Blackjack', minBet: 5, maxBet: 500 },
    { id: 'roulette', name: 'Roulette', minBet: 1, maxBet: 1000 },
    { id: 'baccarat', name: 'Baccarat', minBet: 10, maxBet: 2000 }
  ],
  card: [
    { id: 'poker', name: 'Texas Hold\'em Poker', minBet: 10, maxBet: 500 },
    { id: 'video-poker', name: 'Video Poker', minBet: 1, maxBet: 25 }
  ]
};

// Get all games
router.get('/', (req, res) => {
  res.json(games);
});

// Get games by category
router.get('/:category', (req, res) => {
  const { category } = req.params;
  const categoryGames = games[category];
  
  if (!categoryGames) {
    return res.status(404).json({ message: 'Category not found' });
  }
  
  res.json(categoryGames);
});

// Blackjack game logic
router.post('/blackjack/deal', (req, res) => {
  const deck = createDeck();
  shuffleDeck(deck);
  
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];
  
  res.json({
    gameId: generateGameId(),
    playerHand,
    dealerHand: [dealerHand[0], { hidden: true }], // Hide dealer's second card
    deck: deck.length,
    playerScore: calculateBlackjackScore(playerHand),
    dealerScore: calculateBlackjackScore([dealerHand[0]])
  });
});

// Roulette spin
router.post('/roulette/spin', (req, res) => {
  const { bet } = req.body;
  const winningNumber = Math.floor(Math.random() * 37); // 0-36
  const color = getRouletteColor(winningNumber);
  
  res.json({
    winningNumber,
    color,
    bet,
    result: calculateRouletteWin(bet, winningNumber, color)
  });
});

// Helper functions
function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank) });
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

function getCardValue(rank) {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

function calculateBlackjackScore(hand) {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
    }
    score += card.value;
  }
  
  // Handle aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

function getRouletteColor(number) {
  if (number === 0) return 'green';
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(number) ? 'red' : 'black';
}

function calculateRouletteWin(bet, winningNumber, color) {
  // Simplified win calculation - implement full roulette rules as needed
  if (bet.type === 'number' && bet.value === winningNumber) {
    return { win: true, payout: bet.amount * 35 };
  }
  if (bet.type === 'color' && bet.value === color) {
    return { win: true, payout: bet.amount * 2 };
  }
  return { win: false, payout: 0 };
}

function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}

// Poker game logic
function createPokerDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: getPokerCardValue(rank) });
    }
  }
  
  return deck;
}

function getPokerCardValue(rank) {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank);
}

function evaluatePokerHand(cards) {
  if (cards.length < 5) return { rank: 0, name: 'High Card' };
  
  // Sort cards by value for easier evaluation
  const sortedCards = cards.sort((a, b) => b.value - a.value);
  
  // Count ranks and suits
  const rankCounts = {};
  const suitCounts = {};
  
  sortedCards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  
  const ranks = Object.keys(rankCounts);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(count => count >= 5);
  const isStraight = checkStraight(sortedCards);
  
  // Evaluate hand
  if (isStraight && isFlush) {
    const highCard = Math.max(...sortedCards.map(c => c.value));
    if (highCard === 14 && sortedCards[1].value === 13) {
      return { rank: 9, name: 'Royal Flush' };
    }
    return { rank: 8, name: 'Straight Flush' };
  }
  
  if (counts[0] === 4) return { rank: 7, name: 'Four of a Kind' };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: 'Full House' };
  if (isFlush) return { rank: 5, name: 'Flush' };
  if (isStraight) return { rank: 4, name: 'Straight' };
  if (counts[0] === 3) return { rank: 3, name: 'Three of a Kind' };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: 'Two Pair' };
  if (counts[0] === 2) return { rank: 1, name: 'Pair' };
  
  return { rank: 0, name: 'High Card' };
}

function checkStraight(sortedCards) {
  const values = [...new Set(sortedCards.map(c => c.value))].sort((a, b) => b - a);
  
  // Check for regular straight
  for (let i = 0; i < values.length - 4; i++) {
    if (values[i] - values[i + 4] === 4) return true;
  }
  
  // Check for A-2-3-4-5 straight
  if (values.includes(14) && values.includes(2) && values.includes(3) && 
      values.includes(4) && values.includes(5)) {
    return true;
  }
  
  return false;
}

// Poker API endpoints
router.post('/poker/start', (req, res) => {
  const { bet } = req.body;
  const deck = createPokerDeck();
  shuffleDeck(deck);
  
  const playerHand = [deck.pop(), deck.pop()];
  const communityCards = [];
  
  res.json({
    gameId: generateGameId(),
    playerHand,
    communityCards,
    pot: bet * 2,
    phase: 'preflop',
    deck: deck.length
  });
});

router.post('/poker/action', (req, res) => {
  const { action, gameId, amount } = req.body;
  
  // Simplified poker action handling
  // In a real implementation, you'd track game state in a database
  
  res.json({
    success: true,
    action,
    newPhase: 'flop', // This would be calculated based on game state
    pot: 100, // Updated pot amount
    message: `Player chose to ${action}`
  });
});

module.exports = router;
