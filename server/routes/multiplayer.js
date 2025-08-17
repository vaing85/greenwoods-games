const express = require('express');
const PokerRoom = require('../models/PokerRoom');
const Tournament = require('../models/Tournament');
const { ChatMessage, ChatRoom } = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// Authentication middleware (you should import this from a common file)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'greenwood_games_secret_key_2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // For temporary auth, find user in memory
    // In production with MongoDB, use: const user = await User.findById(decoded.userId)
    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Poker Room Routes
router.get('/poker-rooms', authenticateToken, async (req, res) => {
  try {
    const { gameType, stakes } = req.query;
    const rooms = await PokerRoom.findAvailableRooms(stakes, gameType);
    
    res.json({
      success: true,
      rooms: rooms.map(room => formatRoomForAPI(room))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/poker-rooms', authenticateToken, async (req, res) => {
  try {
    const { name, stakes, maxPlayers, gameType, settings } = req.body;
    
    const room = new PokerRoom({
      name,
      stakes: {
        smallBlind: stakes.smallBlind,
        bigBlind: stakes.bigBlind,
        minBuyIn: stakes.minBuyIn || stakes.bigBlind * 20,
        maxBuyIn: stakes.maxBuyIn || stakes.bigBlind * 100
      },
      maxPlayers: maxPlayers || 6,
      gameType: gameType || 'texas-holdem',
      settings: {
        isPrivate: settings?.isPrivate || false,
        allowObservers: settings?.allowObservers !== false,
        actionTimeout: settings?.actionTimeout || 30
      }
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: 'Poker room created successfully',
      room: formatRoomForAPI(room)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/poker-rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const room = await PokerRoom.findById(req.params.roomId)
      .populate('currentPlayers.user', 'username profile.displayName');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      room: formatRoomForAPI(room)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tournament Routes
router.get('/tournaments', authenticateToken, async (req, res) => {
  try {
    const { type, gameType, status } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (gameType) query.gameType = gameType;
    if (status) query['gameState.status'] = status;
    else query['gameState.status'] = { $in: ['scheduled', 'registering', 'running'] };

    const tournaments = await Tournament.find(query)
      .populate('participants.registeredPlayers.user', 'username profile.displayName')
      .sort({ 'schedule.startTime': 1 });
    
    res.json({
      success: true,
      tournaments: tournaments.map(tournament => formatTournamentForAPI(tournament))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tournaments', authenticateToken, async (req, res) => {
  try {
    const {
      name, type, gameType, structure, schedule, participants, prizePool, settings
    } = req.body;
    
    const tournament = new Tournament({
      name,
      type,
      gameType: gameType || 'texas-holdem',
      structure: {
        buyIn: structure.buyIn,
        fee: structure.fee || 0,
        startingChips: structure.startingChips || 1500,
        blindStructure: structure.blindStructure || getDefaultBlindStructure(),
        rebuyPeriod: structure.rebuyPeriod || 0,
        addOnPeriod: structure.addOnPeriod || 0
      },
      schedule,
      participants: {
        maxPlayers: participants.maxPlayers,
        minPlayers: participants.minPlayers || 2
      },
      prizePool: {
        guaranteed: prizePool?.guaranteed || 0
      },
      settings,
      organizer: req.user.id
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      tournament: formatTournamentForAPI(tournament)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tournaments/:tournamentId/register', authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check user balance
    const user = await User.findById(req.user.id);
    const totalCost = tournament.structure.buyIn + tournament.structure.fee;
    
    if (user.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await tournament.registerPlayer(req.user.id);
    
    // Deduct buy-in from user balance
    user.balance -= totalCost;
    await user.save();

    res.json({
      success: true,
      message: 'Successfully registered for tournament',
      tournament: formatTournamentForAPI(tournament)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/tournaments/:tournamentId/register', authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    await tournament.unregisterPlayer(req.user.id);
    
    // Refund buy-in to user balance
    const user = await User.findById(req.user.id);
    const totalCost = tournament.structure.buyIn + tournament.structure.fee;
    user.balance += totalCost;
    await user.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from tournament'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Chat Routes
router.get('/chat/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    
    let query = { 
      room: req.params.roomId, 
      isDeleted: false 
    };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'username profile.displayName profile.avatar')
      .populate('metadata.targetUser', 'username profile.displayName');

    res.json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { message, messageType } = req.body;
    
    // Check if user is muted
    const chatRoom = await ChatRoom.findOne({ roomId: req.params.roomId });
    const participant = chatRoom?.participants.find(
      p => p.user.toString() === req.user.id
    );
    
    if (participant?.isMuted && participant.muteUntil > new Date()) {
      return res.status(403).json({ error: 'You are muted' });
    }

    const chatMessage = new ChatMessage({
      room: req.params.roomId,
      roomType: chatRoom?.type || 'poker',
      sender: req.user.id,
      message: message.trim(),
      messageType: messageType || 'text'
    });

    await chatMessage.save();
    await chatMessage.populate('sender', 'username profile.displayName profile.avatar');

    res.status(201).json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Friend System Routes
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('social.friends.user', 'username profile.displayName profile.avatar profile.lastActive');
    
    res.json({
      success: true,
      friends: user.social?.friends || [],
      friendRequests: user.social?.friendRequests || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/friends/request', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    // Check if already friends or request exists
    const existingFriend = targetUser.social?.friends?.some(
      f => f.user.toString() === req.user.id
    );
    
    if (existingFriend) {
      return res.status(400).json({ error: 'Already friends' });
    }

    const existingRequest = targetUser.social?.friendRequests?.some(
      r => r.from.toString() === req.user.id
    );
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Add friend request
    if (!targetUser.social) targetUser.social = {};
    if (!targetUser.social.friendRequests) targetUser.social.friendRequests = [];
    
    targetUser.social.friendRequests.push({
      from: req.user.id,
      message: req.body.message || ''
    });
    
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function formatRoomForAPI(room) {
  return {
    id: room._id,
    name: room.name,
    type: room.type,
    gameType: room.gameType,
    stakes: room.stakes,
    maxPlayers: room.maxPlayers,
    currentPlayers: room.currentPlayers.length,
    players: room.currentPlayers.map(p => ({
      userId: p.user._id || p.user,
      username: p.user.username || 'Unknown',
      seat: p.seat,
      chips: p.chips,
      status: p.status
    })),
    gameState: {
      phase: room.gameState.phase,
      pot: room.gameState.pot,
      currentPlayerPosition: room.gameState.currentPlayerPosition
    },
    settings: room.settings,
    observerCount: room.observers?.length || 0,
    isActive: room.status === 'active'
  };
}

function formatTournamentForAPI(tournament) {
  return {
    id: tournament._id,
    name: tournament.name,
    type: tournament.type,
    gameType: tournament.gameType,
    structure: tournament.structure,
    schedule: tournament.schedule,
    participants: {
      maxPlayers: tournament.participants.maxPlayers,
      currentPlayers: tournament.participants.currentPlayers,
      registeredCount: tournament.participants.registeredPlayers?.length || 0
    },
    prizePool: {
      total: tournament.calculatedPrizePool,
      guaranteed: tournament.prizePool.guaranteed
    },
    gameState: tournament.gameState,
    settings: tournament.settings
  };
}

function getDefaultBlindStructure() {
  return [
    { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 10 },
    { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 10 },
    { level: 3, smallBlind: 25, bigBlind: 50, ante: 0, duration: 10 },
    { level: 4, smallBlind: 50, bigBlind: 100, ante: 0, duration: 10 },
    { level: 5, smallBlind: 75, bigBlind: 150, ante: 0, duration: 10 },
    { level: 6, smallBlind: 100, bigBlind: 200, ante: 25, duration: 10 }
  ];
}

module.exports = router;
