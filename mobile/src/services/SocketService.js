import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  async connect(serverUrl = 'http://localhost:5000') {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 10
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.connected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.connected = true;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        this.connected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Game-specific methods
  joinPokerRoom(roomId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('join-poker-room', { roomId }, callback);
  }

  leavePokerRoom(roomId) {
    if (!this.isConnected()) return;
    
    this.socket.emit('leave-poker-room', { roomId });
  }

  makePokerAction(action, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('poker-action', action, callback);
  }

  sendChatMessage(roomId, message, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('chat-message', { roomId, message }, callback);
  }

  // Tournament methods
  joinTournament(tournamentId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('join-tournament', { tournamentId }, callback);
  }

  leaveTournament(tournamentId) {
    if (!this.isConnected()) return;
    
    this.socket.emit('leave-tournament', { tournamentId });
  }

  // Phase 4 Game methods
  joinBaccaratGame(gameId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('join-baccarat', { gameId }, callback);
  }

  placeBaccaratBet(gameId, bet, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('baccarat-bet', { gameId, bet }, callback);
  }

  joinCrapsGame(gameId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('join-craps', { gameId }, callback);
  }

  placeCrapsBet(gameId, bet, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('craps-bet', { gameId, bet }, callback);
  }

  rollCrapsDice(gameId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('craps-roll', { gameId }, callback);
  }

  // Event listener management
  on(event, callback) {
    if (!this.socket) return;
    
    this.socket.on(event, callback);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    this.socket.off(event, callback);
    
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data, callback) {
    if (!this.isConnected()) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }
    
    this.socket.emit(event, data, callback);
  }

  // Real-time game state synchronization
  syncGameState(gameType, gameId, state) {
    if (!this.isConnected()) return;
    
    this.socket.emit('sync-game-state', {
      gameType,
      gameId,
      state,
      timestamp: Date.now()
    });
  }

  requestGameState(gameType, gameId, callback) {
    if (!this.isConnected()) return;
    
    this.socket.emit('request-game-state', {
      gameType,
      gameId
    }, callback);
  }

  // Multiplayer lobby management
  joinLobby(lobbyType = 'general') {
    if (!this.isConnected()) return;
    
    this.socket.emit('join-lobby', { lobbyType });
  }

  leaveLobby(lobbyType = 'general') {
    if (!this.isConnected()) return;
    
    this.socket.emit('leave-lobby', { lobbyType });
  }

  // Real-time notifications
  subscribeToNotifications(userId) {
    if (!this.isConnected()) return;
    
    this.socket.emit('subscribe-notifications', { userId });
  }

  unsubscribeFromNotifications(userId) {
    if (!this.isConnected()) return;
    
    this.socket.emit('unsubscribe-notifications', { userId });
  }

  // Connection status monitoring
  onConnectionStatusChange(callback) {
    if (!this.socket) return;
    
    this.socket.on('connect', () => callback(true));
    this.socket.on('disconnect', () => callback(false));
  }

  // Cleanup
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
    }
    this.listeners.clear();
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
