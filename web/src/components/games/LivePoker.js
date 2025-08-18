import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSocket } from '../../utils/socket';
import './LivePoker.css';

const LivePoker = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const newSocket = createSocket();
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('authenticate', { token, userId: user.id });
      });

      newSocket.on('authenticated', () => {
        console.log('✅ Socket authenticated');
        loadAvailableRooms();
      });

      newSocket.on('authentication_error', (data) => {
        console.error('❌ Socket authentication failed:', data);
      });

      // Poker room events
      newSocket.on('poker_room_joined', (data) => {
        setCurrentRoom(data.room);
        joinChatRoom(data.room.id);
      });

      newSocket.on('game_started', (data) => {
        setGameState(data.gameState);
      });

      newSocket.on('game_state_updated', (data) => {
        setGameState(data.gameState);
      });

      newSocket.on('player_sat_down', (data) => {
        setCurrentRoom(data.room);
      });

      newSocket.on('player_stood_up', (data) => {
        setCurrentRoom(data.room);
      });

      // Chat events
      newSocket.on('chat_joined', (data) => {
        setChatMessages(data.messages);
      });

      newSocket.on('new_message', (data) => {
        setChatMessages(prev => [...prev, data.message]);
      });

      newSocket.on('available_rooms', (data) => {
        setAvailableRooms(data.rooms);
      });

      newSocket.on('error', (data) => {
        alert(`Error: ${data.message}`);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const loadAvailableRooms = () => {
    if (socket) {
      socket.emit('get_available_rooms', { gameType: 'texas-holdem' });
    }
  };

  const joinChatRoom = (roomId) => {
    if (socket) {
      socket.emit('join_chat', { roomId, roomType: 'poker' });
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_poker_room', { roomId });
    }
  };

  const sitDown = (seat, buyIn) => {
    if (socket && currentRoom) {
      socket.emit('sit_down', {
        roomId: currentRoom.id,
        seat,
        buyIn
      });
    }
  };

  const standUp = () => {
    if (socket && currentRoom) {
      socket.emit('stand_up', { roomId: currentRoom.id });
    }
  };

  const makePokerAction = (action, amount = 0) => {
    if (socket && currentRoom) {
      socket.emit('poker_action', {
        roomId: currentRoom.id,
        action,
        amount
      });
    }
  };

  const sendChatMessage = () => {
    if (socket && currentRoom && chatInput.trim()) {
      socket.emit('send_message', {
        roomId: currentRoom.id,
        message: chatInput.trim()
      });
      setChatInput('');
    }
  };

  const createRoom = (roomData) => {
    if (socket) {
      socket.emit('create_poker_room', roomData);
      setShowCreateRoom(false);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave_poker_room', { roomId: currentRoom.id });
      setCurrentRoom(null);
      setGameState(null);
      setChatMessages([]);
      loadAvailableRooms();
    }
  };

  if (!isConnected) {
    return (
      <div className="live-poker-container">
        <div className="connecting">
          <h2>🎰 Connecting to Greenwood Games Live Poker...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (currentRoom) {
    return (
      <div className="live-poker-container">
        <div className="poker-room">
          <div className="room-header">
            <h2>🎲 {currentRoom.name}</h2>
            <div className="room-info">
              <span>Stakes: ${currentRoom.stakes.smallBlind}/${currentRoom.stakes.bigBlind}</span>
              <span>Players: {currentRoom.currentPlayers.length}/{currentRoom.maxPlayers}</span>
              <button onClick={leaveRoom} className="leave-btn">Leave Table</button>
            </div>
          </div>

          <div className="poker-table">
            <PokerTable
              room={currentRoom}
              gameState={gameState}
              onSitDown={sitDown}
              onStandUp={standUp}
              onPokerAction={makePokerAction}
              currentUserId={user.id}
            />
          </div>

          <div className="game-chat">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.messageType}`}>
                  {msg.sender && (
                    <span className="sender">{msg.sender.username}: </span>
                  )}
                  <span className="message">{msg.message}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendChatMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-poker-container">
      <div className="lobby">
        <div className="lobby-header">
          <h2>🎰 Live Poker Lobby</h2>
          <button 
            onClick={() => setShowCreateRoom(true)}
            className="create-room-btn"
          >
            Create Room
          </button>
        </div>

        <div className="available-rooms">
          <h3>Available Tables</h3>
          {availableRooms.length === 0 ? (
            <div className="no-rooms">
              <p>No tables available. Create one to start playing!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {availableRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => joinRoom(room.id)}
                />
              ))}
            </div>
          )}
        </div>

        {showCreateRoom && (
          <CreateRoomModal
            onClose={() => setShowCreateRoom(false)}
            onCreate={createRoom}
          />
        )}
      </div>
    </div>
  );
};

const PokerTable = ({ room, gameState, onSitDown, onStandUp, onPokerAction, currentUserId }) => {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [buyInAmount, setBuyInAmount] = useState(room.stakes.minBuyIn);

  const isPlayerSeated = room.currentPlayers.some(p => p.userId === currentUserId);
  const currentPlayer = room.currentPlayers.find(p => p.userId === currentUserId);
  const isCurrentPlayerTurn = gameState?.currentPlayerPosition === currentPlayer?.seat;

  const handleSitDown = () => {
    if (selectedSeat && buyInAmount >= room.stakes.minBuyIn) {
      onSitDown(selectedSeat, buyInAmount);
      setSelectedSeat(null);
    }
  };

  const renderSeat = (seatNumber) => {
    const player = room.currentPlayers.find(p => p.seat === seatNumber);
    const isEmpty = !player;
    const isSelected = selectedSeat === seatNumber;

    return (
      <div
        key={seatNumber}
        className={`poker-seat seat-${seatNumber} ${isEmpty ? 'empty' : 'occupied'} ${isSelected ? 'selected' : ''} ${
          gameState?.currentPlayerPosition === seatNumber ? 'current-turn' : ''
        }`}
        onClick={() => isEmpty && !isPlayerSeated && setSelectedSeat(seatNumber)}
      >
        {isEmpty ? (
          <div className="empty-seat">
            <span>Seat {seatNumber}</span>
            {isSelected && (
              <div className="seat-controls">
                <input
                  type="number"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(Number(e.target.value))}
                  min={room.stakes.minBuyIn}
                  max={room.stakes.maxBuyIn}
                  placeholder="Buy-in"
                />
                <button onClick={handleSitDown}>Sit</button>
              </div>
            )}
          </div>
        ) : (
          <div className="player-info">
            <div className="player-name">{player.username || 'Player'}</div>
            <div className="player-chips">${player.chips}</div>
            {player.userId === currentUserId && (
              <button onClick={onStandUp} className="stand-up-btn">
                Stand Up
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="poker-table-container">
      <div className="table-center">
        <div className="community-cards">
          {gameState?.communityCards?.map((card, index) => (
            <div key={index} className="card">
              {card.rank}{card.suit}
            </div>
          ))}
        </div>
        <div className="pot">
          Pot: ${gameState?.pot || 0}
        </div>
        <div className="game-phase">
          {gameState?.phase || 'Waiting for players'}
        </div>
      </div>

      <div className="seats-container">
        {[1, 2, 3, 4, 5, 6].map(renderSeat)}
      </div>

      {isPlayerSeated && gameState && (
        <div className="action-panel">
          <div className="player-cards">
            {/* Show player's hole cards */}
            <div className="hole-cards">
              <div className="card">🂠</div>
              <div className="card">🂠</div>
            </div>
          </div>
          
          {isCurrentPlayerTurn && (
            <div className="action-buttons">
              <button onClick={() => onPokerAction('fold')} className="fold-btn">
                Fold
              </button>
              <button onClick={() => onPokerAction('check')} className="check-btn">
                Check
              </button>
              <button onClick={() => onPokerAction('call')} className="call-btn">
                Call ${gameState.currentBet}
              </button>
              <div className="raise-controls">
                <input
                  type="number"
                  min={gameState.currentBet * 2}
                  placeholder="Raise amount"
                  id="raise-amount"
                />
                <button
                  onClick={() => {
                    const amount = document.getElementById('raise-amount').value;
                    onPokerAction('raise', Number(amount));
                  }}
                  className="raise-btn"
                >
                  Raise
                </button>
              </div>
              <button onClick={() => onPokerAction('all-in')} className="all-in-btn">
                All-In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RoomCard = ({ room, onJoin }) => (
  <div className="room-card">
    <h4>{room.name}</h4>
    <div className="room-details">
      <p>Stakes: ${room.stakes.smallBlind}/${room.stakes.bigBlind}</p>
      <p>Players: {room.currentPlayers}/{room.maxPlayers}</p>
      <p>Game: {room.gameType}</p>
    </div>
    <button onClick={onJoin} className="join-btn">
      Join Table
    </button>
  </div>
);

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    stakes: {
      smallBlind: 1,
      bigBlind: 2,
      minBuyIn: 40,
      maxBuyIn: 200
    },
    maxPlayers: 6,
    gameType: 'texas-holdem',
    settings: {
      isPrivate: false,
      allowObservers: true,
      actionTimeout: 30
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomData.name.trim()) {
      onCreate(roomData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-room-modal">
        <h3>Create Poker Room</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name:</label>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData({...roomData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Small Blind:</label>
            <input
              type="number"
              value={roomData.stakes.smallBlind}
              onChange={(e) => setRoomData({
                ...roomData,
                stakes: {...roomData.stakes, smallBlind: Number(e.target.value)}
              })}
              min="0.01"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Big Blind:</label>
            <input
              type="number"
              value={roomData.stakes.bigBlind}
              onChange={(e) => setRoomData({
                ...roomData,
                stakes: {...roomData.stakes, bigBlind: Number(e.target.value)}
              })}
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Max Players:</label>
            <select
              value={roomData.maxPlayers}
              onChange={(e) => setRoomData({...roomData, maxPlayers: Number(e.target.value)})}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create Room</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LivePoker;
