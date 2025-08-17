const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Production middleware imports
const {
  securityHeaders,
  generalLimiter,
  requestLogger,
  errorHandler,
  SECURITY_CONFIG
} = require('./middleware/security');

// Database connection
require('./config/database');

// Import models
const User = require('./models/User');
const GameSession = require('./models/GameSession');
const Transaction = require('./models/Transaction');
const PokerRoom = require('./models/PokerRoom');
const Tournament = require('./models/Tournament');
const { ChatMessage, ChatRoom } = require('./models/Chat');

// Import multiplayer system
const MultiplayerManager = require('./utils/MultiplayerManager');

const app = express();
const server = http.createServer(app);

// Production CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:19006"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions
});

// Initialize multiplayer system
const multiplayerManager = new MultiplayerManager(io);

// Production middleware stack
if (process.env.NODE_ENV === 'production') {
  app.use(securityHeaders);
  app.use(generalLimiter);
}
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.UPLOAD_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.UPLOAD_LIMIT || '10mb' }));

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version || '1.0.0'
  });
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
    activeConnections: io.engine.clientsCount,
    totalRequests: global.requestCount || 0
  };
  res.json(metrics);
});

// Routes - Using temporary auth for development
app.use('/api/auth', require('./routes/auth-temp'));
app.use('/api/games', require('./routes/games'));
app.use('/api/user', require('./routes/user'));
app.use('/api/multiplayer', require('./routes/multiplayer'));
app.use('/api/phase4', require('./routes/phase4games'));
app.use('/api/phase8', require('./routes/phase8'));

// Socket.IO for real-time game features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join game room
  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    console.log(`User ${socket.id} joined game ${gameId}`);
  });

  // Handle slot machine spin
  socket.on('spin-slot', (data) => {
    const result = generateSlotResult();
    socket.emit('slot-result', result);
  });

  // Handle poker game events
  socket.on('start-poker-game', (data) => {
    const gameState = generatePokerGameState(data);
    socket.emit('poker-game-state', gameState);
  });

  socket.on('poker-action', (data) => {
    const result = processPokerAction(data);
    socket.emit('poker-game-state', result.gameState);
    
    if (result.gameOver) {
      socket.emit('poker-result', result.finalResult);
    }
  });

  // Handle card game events
  socket.on('card-action', (data) => {
    // Process card game action
    io.to(data.gameId).emit('game-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Game logic functions
function generateSlotResult() {
  const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
  const reels = [];
  
  for (let i = 0; i < 3; i++) {
    reels.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }
  
  const isWin = reels[0] === reels[1] && reels[1] === reels[2];
  const multiplier = isWin ? getMultiplier(reels[0]) : 0;
  
  return {
    reels,
    isWin,
    multiplier,
    timestamp: new Date()
  };
}

function getMultiplier(symbol) {
  const multipliers = {
    '🍒': 2,
    '🍋': 3,
    '🍊': 4,
    '🍇': 5,
    '🔔': 10,
    '💎': 25,
    '7️⃣': 100
  };
  return multipliers[symbol] || 1;
}

// Poker game logic
function generatePokerGameState(data) {
  const { bet, userId } = data;
  const deck = createPokerDeck();
  shuffleDeck(deck);
  
  const playerHand = [deck.pop(), deck.pop()];
  const opponentHand = [deck.pop(), deck.pop()]; // Hidden from player
  const communityCards = [];
  
  return {
    gameId: Math.random().toString(36).substr(2, 9),
    phase: 'preflop',
    playerHand,
    communityCards,
    pot: bet * 2,
    playerBet: bet,
    opponentBet: bet,
    deck: deck.length,
    handRank: 'High Card'
  };
}

function processPokerAction(data) {
  const { action, userId } = data;
  
  // Simplified poker action processing
  // In production, you'd maintain game state in a database
  
  let gameState = {
    phase: 'flop',
    pot: 40,
    playerBet: 20,
    opponentBet: 20,
    communityCards: [
      { suit: '♠', rank: 'A', value: 14 },
      { suit: '♥', rank: 'K', value: 13 },
      { suit: '♦', rank: 'Q', value: 12 }
    ]
  };
  
  let gameOver = false;
  let finalResult = null;
  
  if (action === 'fold') {
    gameOver = true;
    finalResult = {
      winner: 'opponent',
      message: 'You folded. Opponent wins.',
      winAmount: 0
    };
  } else if (action === 'call') {
    // Continue to next phase or showdown
    gameState.phase = 'turn';
  } else if (action === 'raise') {
    gameState.pot += data.amount || 10;
    gameState.playerBet += data.amount || 10;
  }
  
  return { gameState, gameOver, finalResult };
}

function createPokerDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ 
        suit, 
        rank, 
        value: rank === 'A' ? 14 : ['J', 'Q', 'K'].includes(rank) ? 
               ['J', 'Q', 'K'].indexOf(rank) + 11 : parseInt(rank) 
      });
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

// Request counter middleware
app.use((req, res, next) => {
  global.requestCount = (global.requestCount || 0) + 1;
  next();
});

// Production error handling
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connections
    require('mongoose').connection.close().then(() => {
      console.log('Database connection closed.');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing server shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(PORT, () => {
  console.log(`🚀 Greenwood Games Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'Enhanced' : 'Development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
