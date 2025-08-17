import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  FlatList,
  Modal
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import socketService from '../services/SocketService';

const LivePokerScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [playerAction, setPlayerAction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connectSocket();
    loadRooms();

    return () => {
      if (currentRoom) {
        socketService.leavePokerRoom(currentRoom.id);
      }
      socketService.removeAllListeners();
    };
  }, []);

  const connectSocket = async () => {
    try {
      await socketService.connect();
      setConnected(true);
      
      // Set up event listeners
      socketService.on('room-list', (roomList) => {
        setRooms(roomList);
      });

      socketService.on('room-joined', (room) => {
        setCurrentRoom(room);
        Alert.alert('Success', `Joined room: ${room.name}`);
      });

      socketService.on('game-state', (state) => {
        setGameState(state);
      });

      socketService.on('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
      });

      socketService.on('player-action-required', (action) => {
        setPlayerAction(action);
        setShowActionModal(true);
      });

      socketService.on('game-ended', (result) => {
        Alert.alert('Game Ended', `Winner: ${result.winner}`);
        setGameState(null);
      });

      socketService.on('error', (error) => {
        Alert.alert('Error', error.message);
      });

      socketService.onConnectionStatusChange(setConnected);

    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to game server');
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/poker/rooms', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const joinRoom = (roomId) => {
    if (!connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    socketService.joinPokerRoom(roomId, (response) => {
      if (response.success) {
        const room = rooms.find(r => r.id === roomId);
        setCurrentRoom(room);
        setChatMessages([]);
      } else {
        Alert.alert('Error', response.error || 'Failed to join room');
      }
    });
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socketService.leavePokerRoom(currentRoom.id);
      setCurrentRoom(null);
      setGameState(null);
      setChatMessages([]);
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    socketService.sendChatMessage(currentRoom.id, newMessage.trim(), (response) => {
      if (response.success) {
        setNewMessage('');
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    });
  };

  const makePokerAction = (action, amount = 0) => {
    if (!currentRoom || !playerAction) return;

    socketService.makePokerAction({
      roomId: currentRoom.id,
      action: action,
      amount: amount
    }, (response) => {
      if (response.success) {
        setShowActionModal(false);
        setPlayerAction(null);
      } else {
        Alert.alert('Error', response.error || 'Action failed');
      }
    });
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => joinRoom(item.id)}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomStakes}>${item.smallBlind}/${item.bigBlind}</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomPlayers}>
          {item.players?.length || 0}/{item.maxPlayers} Players
        </Text>
        <Text style={styles.roomStatus}>
          Status: {item.status || 'Waiting'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessage}>
      <Text style={styles.chatUser}>{item.username}:</Text>
      <Text style={styles.chatText}>{item.message}</Text>
    </View>
  );

  const renderGameState = () => {
    if (!gameState) return null;

    return (
      <View style={styles.gameArea}>
        <Text style={styles.gameTitle}>Texas Hold'em Poker</Text>
        
        {/* Community Cards */}
        {gameState.communityCards && gameState.communityCards.length > 0 && (
          <View style={styles.communityCards}>
            <Text style={styles.cardsLabel}>Community Cards:</Text>
            <View style={styles.cardsRow}>
              {gameState.communityCards.map((card, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardText}>
                    {card.value} {card.suit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Player Hand */}
        {gameState.playerHand && (
          <View style={styles.playerHand}>
            <Text style={styles.cardsLabel}>Your Hand:</Text>
            <View style={styles.cardsRow}>
              {gameState.playerHand.map((card, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardText}>
                    {card.value} {card.suit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pot and Current Bet */}
        <View style={styles.gameInfo}>
          <Text style={styles.potAmount}>
            Pot: ${gameState.pot || 0}
          </Text>
          <Text style={styles.currentBet}>
            Current Bet: ${gameState.currentBet || 0}
          </Text>
        </View>

        {/* Players */}
        {gameState.players && (
          <ScrollView horizontal style={styles.playersContainer}>
            {gameState.players.map((player, index) => (
              <View key={index} style={[
                styles.playerCard,
                player.isCurrentPlayer && styles.activePlayer
              ]}>
                <Text style={styles.playerName}>{player.username}</Text>
                <Text style={styles.playerChips}>${player.chips}</Text>
                <Text style={styles.playerStatus}>{player.status}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderActionModal = () => (
    <Modal visible={showActionModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.actionModal}>
          <Text style={styles.actionTitle}>Your Turn</Text>
          <Text style={styles.actionSubtitle}>
            Current Bet: ${playerAction?.currentBet || 0}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.foldButton]}
              onPress={() => makePokerAction('fold')}
            >
              <Text style={styles.actionButtonText}>Fold</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => makePokerAction('call')}
            >
              <Text style={styles.actionButtonText}>
                Call ${playerAction?.callAmount || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.raiseButton]}
              onPress={() => makePokerAction('raise', (playerAction?.callAmount || 0) * 2)}
            >
              <Text style={styles.actionButtonText}>Raise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!currentRoom) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Live Poker</Text>
          <View style={styles.connectionStatus}>
            <Text style={[styles.statusText, { color: connected ? '#4CAF50' : '#f44336' }]}>
              {connected ? '● Online' : '● Offline'}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.roomsList}>
          <Text style={styles.sectionTitle}>Available Rooms</Text>
          <FlatList
            data={rooms}
            renderItem={renderRoom}
            keyExtractor={(item) => item.id}
            refreshing={false}
            onRefresh={loadRooms}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={leaveRoom} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Leave Room</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentRoom.name}</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      {renderGameState()}

      {/* Chat Section */}
      <View style={styles.chatContainer}>
        <Text style={styles.chatTitle}>Chat</Text>
        <FlatList
          data={chatMessages}
          renderItem={renderChatMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.chatList}
        />
        <View style={styles.chatInput}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendChatMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderActionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f4c3a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e7d32',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balance: {
    color: '#fff',
    fontSize: 16,
  },
  connectionStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roomsList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  roomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomStakes: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomPlayers: {
    color: '#ccc',
    fontSize: 14,
  },
  roomStatus: {
    color: '#4CAF50',
    fontSize: 14,
  },
  gameArea: {
    flex: 1,
    padding: 15,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  communityCards: {
    marginBottom: 15,
    alignItems: 'center',
  },
  playerHand: {
    marginBottom: 15,
    alignItems: 'center',
  },
  cardsLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    margin: 2,
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  potAmount: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentBet: {
    color: '#fff',
    fontSize: 16,
  },
  playersContainer: {
    marginBottom: 10,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  activePlayer: {
    backgroundColor: '#ffd700',
  },
  playerName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerChips: {
    color: '#4CAF50',
    fontSize: 12,
  },
  playerStatus: {
    color: '#ccc',
    fontSize: 10,
  },
  chatContainer: {
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chatList: {
    flex: 1,
    marginBottom: 10,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  chatUser: {
    color: '#ffd700',
    fontWeight: 'bold',
    marginRight: 5,
  },
  chatText: {
    color: '#fff',
    flex: 1,
  },
  chatInput: {
    flexDirection: 'row',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    backgroundColor: '#1e7d32',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  foldButton: {
    backgroundColor: '#f44336',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  raiseButton: {
    backgroundColor: '#ff9800',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LivePokerScreen;
