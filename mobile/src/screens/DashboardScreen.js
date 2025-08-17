import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [games, setGames] = useState({
    slots: [],
    table: [],
    card: [],
    poker: [],
    phase4: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
      Alert.alert('Error', 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const GameCard = ({ game, onPress, icon }) => (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <Text style={styles.gameIcon}>{icon}</Text>
      <Text style={styles.gameTitle}>{game.name}</Text>
      <View style={styles.gameInfo}>
        <Text style={styles.gameInfoText}>Min: ${game.minBet}</Text>
        <Text style={styles.gameInfoText}>Max: ${game.maxBet}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>${user?.balance}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎰 Slot Machines</Text>
        <View style={styles.gameGrid}>
          {games.slots.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              icon="🎰"
              onPress={() => navigation.navigate('SlotMachine', { gameId: game.id })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🃏 Table Games</Text>
        <View style={styles.gameGrid}>
          {games.table.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              icon={game.id === 'blackjack' ? '🃏' : game.id === 'roulette' ? '🎲' : '🎯'}
              onPress={() => {
                if (game.id === 'blackjack') {
                  navigation.navigate('Blackjack');
                } else if (game.id === 'roulette') {
                  navigation.navigate('Roulette');
                }
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Card Games</Text>
        <View style={styles.gameGrid}>
          <GameCard
            game={{ name: 'Blackjack', id: 'blackjack' }}
            icon="🃏"
            onPress={() => navigation.navigate('Blackjack')}
          />
          {games.card.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              icon="🎮"
              onPress={() => Alert.alert('Coming Soon', `${game.name} will be available soon!`)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎰 Phase 4 - New Games</Text>
        <View style={styles.gameGrid}>
          <GameCard
            game={{ name: 'Baccarat', id: 'baccarat' }}
            icon="🎴"
            onPress={() => navigation.navigate('Baccarat')}
          />
          <GameCard
            game={{ name: 'Craps', id: 'craps' }}
            icon="🎲"
            onPress={() => navigation.navigate('Craps')}
          />
          <GameCard
            game={{ name: 'Video Poker', id: 'videopoker' }}
            icon="🃖"
            onPress={() => navigation.navigate('VideoPoker')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>♠️ Multiplayer</Text>
        <View style={styles.gameGrid}>
          <GameCard
            game={{ name: 'Live Poker', id: 'livepoker' }}
            icon="♠️"
            onPress={() => navigation.navigate('LivePoker')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎭 Phase 6 - Advanced Features</Text>
        <View style={styles.gameGrid}>
          <GameCard
            game={{ name: 'Live Dealer', id: 'livedealer' }}
            icon="🎭"
            onPress={() => navigation.navigate('LiveDealer')}
          />
          <GameCard
            game={{ name: 'Social Hub', id: 'socialhub' }}
            icon="👥"
            onPress={() => navigation.navigate('SocialHub')}
          />
          <GameCard
            game={{ name: 'Analytics', id: 'analytics' }}
            icon="📊"
            onPress={() => navigation.navigate('Analytics')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Phase 8 - Advanced Gaming Features</Text>
        <View style={styles.gameGrid}>
          <GameCard
            game={{ name: 'Crypto Wallet', id: 'cryptowallet' }}
            icon="₿"
            onPress={() => navigation.navigate('CryptoWallet')}
          />
          <GameCard
            game={{ name: 'AI Assistant', id: 'aigaming' }}
            icon="🤖"
            onPress={() => navigation.navigate('AIGaming')}
          />
          <GameCard
            game={{ name: 'Tournaments', id: 'tournament' }}
            icon="🏆"
            onPress={() => navigation.navigate('Tournament')}
          />
          <GameCard
            game={{ name: 'Jackpots', id: 'progressivejackpot' }}
            icon="💰"
            onPress={() => navigation.navigate('ProgressiveJackpot')}
          />
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$0</Text>
            <Text style={styles.statLabel}>Total Winnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🏆</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
  },
  balanceContainer: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gameInfoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  statsSection: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 5,
  },
});

export default DashboardScreen;
