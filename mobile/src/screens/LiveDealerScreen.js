import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LiveDealerScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [dealerRooms, setDealerRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [dealerStream, setDealerStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadDealerRooms();
  }, []);

  const loadDealerRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/live-dealer/rooms', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDealerRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error loading dealer rooms:', error);
    }
  };

  const joinDealerRoom = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/live-dealer/join/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentRoom(data.room);
        setIsConnected(true);
        Alert.alert('Connected', `Joined ${data.room.game} with ${data.room.dealer.name}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to join room');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const leaveDealerRoom = () => {
    setCurrentRoom(null);
    setIsConnected(false);
    setDealerStream(null);
  };

  const renderDealerRoom = (room) => (
    <TouchableOpacity
      key={room.id}
      style={styles.dealerCard}
      onPress={() => joinDealerRoom(room.id)}
    >
      <View style={styles.dealerImageContainer}>
        <Text style={styles.dealerAvatar}>👨‍💼</Text>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>🔴 LIVE</Text>
        </View>
      </View>
      
      <View style={styles.dealerInfo}>
        <Text style={styles.dealerName}>{room.dealer.name}</Text>
        <Text style={styles.gameType}>{room.game}</Text>
        <Text style={styles.tableLimit}>
          ${room.minBet} - ${room.maxBet}
        </Text>
        <Text style={styles.playerCount}>
          {room.players.length}/{room.maxPlayers} players
        </Text>
      </View>
      
      <View style={styles.dealerStats}>
        <Text style={styles.rating}>⭐ {room.dealer.rating}</Text>
        <Text style={styles.language}>🗣️ {room.dealer.language}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDealerStream = () => (
    <View style={styles.streamContainer}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.videoText}>📹 Live Dealer Stream</Text>
        <Text style={styles.dealerStreamName}>{currentRoom?.dealer.name}</Text>
        <Text style={styles.gameStreamType}>{currentRoom?.game}</Text>
      </View>
      
      <View style={styles.streamControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>🔊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>📱</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, styles.leaveButton]}
          onPress={leaveDealerRoom}
        >
          <Text style={styles.controlText}>❌</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGameInterface = () => {
    if (!currentRoom) return null;

    switch (currentRoom.game) {
      case 'Live Blackjack':
        return (
          <View style={styles.gameInterface}>
            <Text style={styles.gameTitle}>Live Blackjack</Text>
            <View style={styles.bettingArea}>
              <TouchableOpacity style={styles.betButton}>
                <Text style={styles.betButtonText}>Bet $10</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.betButton}>
                <Text style={styles.betButtonText}>Bet $25</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.betButton}>
                <Text style={styles.betButtonText}>Bet $50</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Hit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Stand</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Double</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'Live Roulette':
        return (
          <View style={styles.gameInterface}>
            <Text style={styles.gameTitle}>Live Roulette</Text>
            <View style={styles.rouletteTable}>
              <Text style={styles.tableText}>🎯 Place your bets</Text>
              <View style={styles.numberGrid}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <TouchableOpacity key={num} style={styles.numberButton}>
                    <Text style={styles.numberText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      
      case 'Live Baccarat':
        return (
          <View style={styles.gameInterface}>
            <Text style={styles.gameTitle}>Live Baccarat</Text>
            <View style={styles.baccaratTable}>
              <TouchableOpacity style={styles.betArea}>
                <Text style={styles.betAreaText}>PLAYER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.betArea}>
                <Text style={styles.betAreaText}>TIE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.betArea}>
                <Text style={styles.betAreaText}>BANKER</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.gameInterface}>
            <Text style={styles.gameTitle}>{currentRoom.game}</Text>
            <Text style={styles.comingSoon}>Game interface coming soon!</Text>
          </View>
        );
    }
  };

  if (currentRoom && isConnected) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={leaveDealerRoom} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Leave</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Live Dealer</Text>
          <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
        </View>

        {renderDealerStream()}
        {renderGameInterface()}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Dealer Casino</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      <View style={styles.introSection}>
        <Text style={styles.introTitle}>🎭 Live Casino Experience</Text>
        <Text style={styles.introText}>
          Play with real dealers in real-time! Experience the authentic casino atmosphere 
          from your mobile device with professional dealers streaming live.
        </Text>
      </View>

      <View style={styles.dealerRoomsSection}>
        <Text style={styles.sectionTitle}>Available Live Tables</Text>
        
        {dealerRooms.length === 0 ? (
          <View style={styles.mockRooms}>
            {/* Mock dealer rooms for demonstration */}
            {[
              {
                id: 'blackjack-1',
                dealer: { name: 'Sarah Johnson', rating: 4.8, language: 'English' },
                game: 'Live Blackjack',
                minBet: 10,
                maxBet: 500,
                players: [1, 2, 3],
                maxPlayers: 7
              },
              {
                id: 'roulette-1',
                dealer: { name: 'Marco Rodriguez', rating: 4.9, language: 'English/Spanish' },
                game: 'Live Roulette',
                minBet: 5,
                maxBet: 1000,
                players: [1, 2, 3, 4, 5],
                maxPlayers: 8
              },
              {
                id: 'baccarat-1',
                dealer: { name: 'Chen Wei', rating: 4.7, language: 'English/Mandarin' },
                game: 'Live Baccarat',
                minBet: 25,
                maxBet: 2000,
                players: [1, 2],
                maxPlayers: 6
              }
            ].map(renderDealerRoom)}
          </View>
        ) : (
          dealerRooms.map(renderDealerRoom)
        )}
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Live Dealer Features</Text>
        <View style={styles.featuresList}>
          <Text style={styles.feature}>📹 HD video streaming</Text>
          <Text style={styles.feature}>💬 Live chat with dealers</Text>
          <Text style={styles.feature}>🎮 Multiple camera angles</Text>
          <Text style={styles.feature}>🌍 Multi-language support</Text>
          <Text style={styles.feature}>🏆 Professional dealers</Text>
          <Text style={styles.feature}>⚡ Real-time gameplay</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1a1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a2f36',
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
    color: '#ffd700',
    fontSize: 16,
  },
  introSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    margin: 20,
    borderRadius: 10,
  },
  introTitle: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  introText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  dealerRoomsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mockRooms: {
    // Container for mock rooms
  },
  dealerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealerImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  dealerAvatar: {
    fontSize: 40,
  },
  liveIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  liveText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dealerInfo: {
    flex: 1,
    marginRight: 15,
  },
  dealerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gameType: {
    color: '#ffd700',
    fontSize: 14,
    marginBottom: 2,
  },
  tableLimit: {
    color: '#4CAF50',
    fontSize: 12,
    marginBottom: 2,
  },
  playerCount: {
    color: '#ccc',
    fontSize: 12,
  },
  dealerStats: {
    alignItems: 'flex-end',
  },
  rating: {
    color: '#ffd700',
    fontSize: 12,
    marginBottom: 2,
  },
  language: {
    color: '#ccc',
    fontSize: 10,
  },
  streamContainer: {
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  dealerStreamName: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameStreamType: {
    color: '#ccc',
    fontSize: 14,
  },
  streamControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  controlText: {
    fontSize: 16,
  },
  gameInterface: {
    padding: 20,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  bettingArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  betButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  betButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rouletteTable: {
    alignItems: 'center',
  },
  tableText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  numberButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    margin: 2,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  baccaratTable: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  betArea: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  betAreaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  comingSoon: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 10,
  },
  featuresList: {
    marginTop: 10,
  },
  feature: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 10,
  },
});

export default LiveDealerScreen;
