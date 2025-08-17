const PokerRoom = require('../models/PokerRoom');
const Tournament = require('../models/Tournament');
const { ChatMessage, ChatRoom } = require('../models/Chat');
const User = require('../models/User');
const PokerGameEngine = require('../utils/PokerGameEngine');

// Store active game engines
const activeGames = new Map();
const playerSockets = new Map(); // userId -> socketId mapping

class MultiplayerManager {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token, userId } = data;
          // Verify JWT token here
          socket.userId = userId;
          playerSockets.set(userId, socket.id);
          
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('authentication_error', { error: error.message });
        }
      });

      // Poker Room Events
      socket.on('join_poker_room', async (data) => {
        await this.handleJoinPokerRoom(socket, data);
      });

      socket.on('leave_poker_room', async (data) => {
        await this.handleLeavePokerRoom(socket, data);
      });

      socket.on('create_poker_room', async (data) => {
        await this.handleCreatePokerRoom(socket, data);
      });

      socket.on('get_available_rooms', async (data) => {
        await this.handleGetAvailableRooms(socket, data);
      });

      // Game Actions
      socket.on('poker_action', async (data) => {
        await this.handlePokerAction(socket, data);
      });

      socket.on('sit_down', async (data) => {
        await this.handleSitDown(socket, data);
      });

      socket.on('stand_up', async (data) => {
        await this.handleStandUp(socket, data);
      });

      // Chat Events
      socket.on('join_chat', async (data) => {
        await this.handleJoinChat(socket, data);
      });

      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      socket.on('react_to_message', async (data) => {
        await this.handleReactToMessage(socket, data);
      });

      // Tournament Events
      socket.on('register_tournament', async (data) => {
        await this.handleRegisterTournament(socket, data);
      });

      socket.on('unregister_tournament', async (data) => {
        await this.handleUnregisterTournament(socket, data);
      });

      socket.on('get_tournaments', async (data) => {
        await this.handleGetTournaments(socket, data);
      });

      // Observer Events
      socket.on('observe_table', async (data) => {
        await this.handleObserveTable(socket, data);
      });

      socket.on('stop_observing', async (data) => {
        await this.handleStopObserving(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  async handleJoinPokerRoom(socket, data) {
    try {
      const { roomId } = data;
      const room = await PokerRoom.findById(roomId).populate('currentPlayers.user');
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Join socket room
      socket.join(`poker_room_${roomId}`);
      socket.currentPokerRoom = roomId;

      // Add as observer if not already a player
      const isPlayer = room.currentPlayers.some(p => p.user._id.toString() === socket.userId);
      
      if (!isPlayer && room.settings.allowObservers) {
        room.observers.push({
          user: socket.userId
        });
        await room.save();
      }

      // Send room state
      socket.emit('poker_room_joined', {
        room: this.formatRoomForClient(room),
        isPlayer: isPlayer
      });

      // Notify others
      socket.to(`poker_room_${roomId}`).emit('player_joined_room', {
        userId: socket.userId,
        isObserver: !isPlayer
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleLeavePokerRoom(socket, data) {
    try {
      const { roomId } = data;
      const room = await PokerRoom.findById(roomId);
      
      if (room) {
        // Remove from observers
        room.observers = room.observers.filter(
          o => o.user.toString() !== socket.userId
        );
        await room.save();

        // Leave socket room
        socket.leave(`poker_room_${roomId}`);
        socket.currentPokerRoom = null;

        // Notify others
        socket.to(`poker_room_${roomId}`).emit('player_left_room', {
          userId: socket.userId
        });
      }

      socket.emit('poker_room_left', { roomId });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleCreatePokerRoom(socket, data) {
    try {
      const { name, stakes, maxPlayers, gameType, settings } = data;
      
      const room = new PokerRoom({
        name,
        stakes,
        maxPlayers,
        gameType: gameType || 'texas-holdem',
        settings: {
          ...settings,
          allowObservers: settings?.allowObservers !== false
        }
      });

      await room.save();

      socket.emit('poker_room_created', {
        room: this.formatRoomForClient(room)
      });

      // Broadcast new room to others looking for games
      this.io.emit('new_poker_room', {
        room: this.formatRoomForClient(room)
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleGetAvailableRooms(socket, data) {
    try {
      const { gameType, stakes } = data;
      const rooms = await PokerRoom.findAvailableRooms(stakes, gameType);
      
      socket.emit('available_rooms', {
        rooms: rooms.map(room => this.formatRoomForClient(room))
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleSitDown(socket, data) {
    try {
      const { roomId, seat, buyIn } = data;
      const room = await PokerRoom.findById(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Validate buy-in amount
      if (buyIn < room.stakes.minBuyIn || buyIn > room.stakes.maxBuyIn) {
        socket.emit('error', { 
          message: `Buy-in must be between ${room.stakes.minBuyIn} and ${room.stakes.maxBuyIn}` 
        });
        return;
      }

      // Add player to room
      await room.addPlayer(socket.userId, buyIn, seat);

      // Update user balance (deduct buy-in)
      const user = await User.findById(socket.userId);
      if (user.balance < buyIn) {
        socket.emit('error', { message: 'Insufficient balance' });
        return;
      }
      
      user.balance -= buyIn;
      await user.save();

      // Join as active player
      socket.join(`poker_room_${roomId}`);

      // Start game if enough players
      if (room.canStartGame() && !activeGames.has(roomId)) {
        const gameEngine = new PokerGameEngine(room);
        activeGames.set(roomId, gameEngine);
        
        const gameState = gameEngine.startNewHand();
        
        this.io.to(`poker_room_${roomId}`).emit('game_started', {
          gameState: this.formatGameStateForClient(gameState)
        });
      }

      // Notify room about new player
      this.io.to(`poker_room_${roomId}`).emit('player_sat_down', {
        userId: socket.userId,
        seat: seat,
        chips: buyIn,
        room: this.formatRoomForClient(await PokerRoom.findById(roomId).populate('currentPlayers.user'))
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleStandUp(socket, data) {
    try {
      const { roomId } = data;
      const room = await PokerRoom.findById(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const player = room.currentPlayers.find(
        p => p.user.toString() === socket.userId
      );

      if (player) {
        // Return chips to user balance
        const user = await User.findById(socket.userId);
        user.balance += player.chips;
        await user.save();

        // Remove player from room
        await room.removePlayer(socket.userId);

        // Stop game if not enough players
        if (!room.canStartGame() && activeGames.has(roomId)) {
          const gameEngine = activeGames.get(roomId);
          gameEngine.cleanup();
          activeGames.delete(roomId);
          
          this.io.to(`poker_room_${roomId}`).emit('game_stopped', {
            reason: 'Not enough players'
          });
        }

        // Notify room
        this.io.to(`poker_room_${roomId}`).emit('player_stood_up', {
          userId: socket.userId,
          room: this.formatRoomForClient(await PokerRoom.findById(roomId).populate('currentPlayers.user'))
        });
      }

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handlePokerAction(socket, data) {
    try {
      const { roomId, action, amount } = data;
      const gameEngine = activeGames.get(roomId);
      
      if (!gameEngine) {
        socket.emit('error', { message: 'No active game in this room' });
        return;
      }

      const gameState = gameEngine.processPlayerAction(socket.userId, action, amount);

      // Save updated room state
      await gameEngine.room.save();

      // Broadcast game state to all players in room
      this.io.to(`poker_room_${roomId}`).emit('game_state_updated', {
        gameState: this.formatGameStateForClient(gameState),
        lastAction: {
          playerId: socket.userId,
          action: action,
          amount: amount
        }
      });

      // Send system message to chat
      await this.sendSystemMessage(roomId, 'poker_action', {
        playerId: socket.userId,
        action: action,
        amount: amount
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleJoinChat(socket, data) {
    try {
      const { roomId, roomType } = data;
      
      let chatRoom = await ChatRoom.findOne({ roomId });
      
      if (!chatRoom) {
        chatRoom = new ChatRoom({
          roomId,
          name: `${roomType} Chat`,
          type: roomType
        });
        await chatRoom.save();
      }

      await chatRoom.addParticipant(socket.userId);
      socket.join(`chat_${roomId}`);

      // Send recent messages
      const recentMessages = await ChatMessage.getRecentMessages(roomId);
      socket.emit('chat_joined', {
        roomId,
        messages: recentMessages
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { roomId, message, messageType } = data;
      
      // Check if user is muted
      const chatRoom = await ChatRoom.findOne({ roomId });
      const participant = chatRoom?.participants.find(
        p => p.user.toString() === socket.userId
      );
      
      if (participant?.isMuted && participant.muteUntil > new Date()) {
        socket.emit('error', { message: 'You are muted' });
        return;
      }

      const chatMessage = new ChatMessage({
        room: roomId,
        roomType: chatRoom?.type || 'poker',
        sender: socket.userId,
        message: message.trim(),
        messageType: messageType || 'text'
      });

      await chatMessage.save();
      await chatMessage.populate('sender', 'username profile.displayName profile.avatar');

      // Update room statistics
      if (chatRoom) {
        chatRoom.statistics.totalMessages += 1;
        chatRoom.statistics.lastActivity = new Date();
        await chatRoom.save();
      }

      // Broadcast message to room
      this.io.to(`chat_${roomId}`).emit('new_message', {
        message: chatMessage
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleReactToMessage(socket, data) {
    try {
      const { messageId, emoji } = data;
      const message = await ChatMessage.findById(messageId);
      
      if (message) {
        await message.addReaction(socket.userId, emoji);
        
        this.io.to(`chat_${message.room}`).emit('message_reaction', {
          messageId,
          userId: socket.userId,
          emoji
        });
      }

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleRegisterTournament(socket, data) {
    try {
      const { tournamentId } = data;
      const tournament = await Tournament.findById(tournamentId);
      
      if (!tournament) {
        socket.emit('error', { message: 'Tournament not found' });
        return;
      }

      await tournament.registerPlayer(socket.userId);

      socket.emit('tournament_registered', {
        tournament: tournament
      });

      // Notify others
      this.io.emit('tournament_updated', {
        tournamentId,
        currentPlayers: tournament.participants.currentPlayers
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  async handleGetTournaments(socket, data) {
    try {
      const { type, gameType } = data;
      const tournaments = await Tournament.findAvailableTournaments(type, gameType);
      
      socket.emit('tournaments_list', {
        tournaments
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  handleDisconnect(socket) {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      playerSockets.delete(socket.userId);
      
      // Handle cleanup for active games, tournaments, etc.
      // In production, you might want to give players time to reconnect
    }
  }

  async sendSystemMessage(roomId, action, metadata) {
    try {
      await ChatMessage.createSystemMessage(roomId, action, metadata);
      
      const recentMessages = await ChatMessage.getRecentMessages(roomId, 1);
      if (recentMessages.length > 0) {
        this.io.to(`chat_${roomId}`).emit('new_message', {
          message: recentMessages[0]
        });
      }
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  }

  formatRoomForClient(room) {
    return {
      id: room._id,
      name: room.name,
      type: room.type,
      gameType: room.gameType,
      stakes: room.stakes,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.currentPlayers.map(p => ({
        userId: p.user._id || p.user,
        username: p.user.username,
        seat: p.seat,
        chips: p.chips,
        status: p.status
      })),
      gameState: room.gameState,
      settings: room.settings,
      observerCount: room.observers.length
    };
  }

  formatGameStateForClient(gameState) {
    return {
      phase: gameState.room.gameState.phase,
      pot: gameState.room.gameState.pot,
      communityCards: gameState.room.gameState.communityCards,
      currentPlayerPosition: gameState.room.gameState.currentPlayerPosition,
      currentBet: gameState.room.gameState.currentBet,
      timeRemaining: gameState.timeRemaining,
      lastAction: gameState.room.gameState.lastAction
    };
  }
}

module.exports = MultiplayerManager;
