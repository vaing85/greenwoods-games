import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TournamentScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, [selectedTab]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/phase8/tournaments?status=${selectedTab}`);
      const data = await response.json();
      
      if (data.success) {
        setTournaments(data.tournaments);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  const registerForTournament = async (tournamentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/phase8/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 'user123',
          playerData: {
            name: 'Player Name',
            level: 'Intermediate',
            rating: 1500
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Successfully registered for tournament!');
        fetchTournaments();
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register for tournament');
    }
  };

  const fetchLeaderboard = async (tournamentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/phase8/tournaments/${tournamentId}/leaderboard`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getTournamentTypeIcon = (type) => {
    switch (type) {
      case 'elimination': return 'sports-esports';
      case 'double_elimination': return 'casino';
      case 'round_robin': return 'group';
      case 'swiss': return 'flag';
      default: return 'event';
    }
  };

  const getTournamentStatusColor = (status) => {
    switch (status) {
      case 'registration': return '#2196F3';
      case 'active': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#FFC107';
    }
  };

  const formatPrizePool = (prizePool) => {
    if (typeof prizePool === 'number') {
      return `$${prizePool.toLocaleString()}`;
    }
    
    if (Array.isArray(prizePool)) {
      const total = prizePool.reduce((sum, prize) => sum + prize.amount, 0);
      return `$${total.toLocaleString()}`;
    }
    
    return '$0';
  };

  const renderTournamentCard = (tournament) => (
    <View key={tournament.id} style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Icon 
            name={getTournamentTypeIcon(tournament.type)} 
            size={24} 
            color={getTournamentStatusColor(tournament.status)} 
          />
          <View style={styles.tournamentDetails}>
            <Text style={styles.tournamentTitle}>{tournament.name}</Text>
            <Text style={styles.tournamentGame}>{tournament.game}</Text>
          </View>
        </View>
        <View style={styles.tournamentStatus}>
          <Text style={[styles.statusBadge, { backgroundColor: getTournamentStatusColor(tournament.status) }]}>
            {tournament.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.tournamentStats}>
        <View style={styles.stat}>
          <Icon name="people" size={16} color="#999" />
          <Text style={styles.statText}>
            {tournament.registeredPlayers?.length || 0}/{tournament.maxPlayers}
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Icon name="monetization-on" size={16} color="#999" />
          <Text style={styles.statText}>{formatPrizePool(tournament.prizePool)}</Text>
        </View>
        
        <View style={styles.stat}>
          <Icon name="schedule" size={16} color="#999" />
          <Text style={styles.statText}>{tournament.type.replace('_', ' ')}</Text>
        </View>
      </View>

      {tournament.startTime && (
        <View style={styles.tournamentTiming}>
          <Icon name="access-time" size={14} color="#666" />
          <Text style={styles.timingText}>
            {tournament.status === 'registration' ? 'Starts: ' : 'Started: '}
            {new Date(tournament.startTime).toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.tournamentActions}>
        {tournament.status === 'registration' && (
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => registerForTournament(tournament.id)}
          >
            <Icon name="add" size={16} color="#FFF" />
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {
            setSelectedTournament(tournament);
            fetchLeaderboard(tournament.id);
            setModalVisible(true);
          }}
        >
          <Icon name="visibility" size={16} color="#FFF" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTournamentModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedTournament?.name}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {selectedTournament && (
              <View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tournament Info</Text>
                  <View style={styles.modalInfoGrid}>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Game</Text>
                      <Text style={styles.modalInfoValue}>{selectedTournament.game}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Type</Text>
                      <Text style={styles.modalInfoValue}>{selectedTournament.type}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Players</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedTournament.registeredPlayers?.length || 0}/{selectedTournament.maxPlayers}
                      </Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Prize Pool</Text>
                      <Text style={styles.modalInfoValue}>{formatPrizePool(selectedTournament.prizePool)}</Text>
                    </View>
                  </View>
                </View>

                {leaderboard && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Leaderboard</Text>
                    {leaderboard.rankings.map((player, index) => (
                      <View key={player.playerId} style={styles.leaderboardItem}>
                        <View style={styles.leaderboardRank}>
                          <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>
                        <View style={styles.leaderboardPlayer}>
                          <Text style={styles.playerName}>
                            {player.playerData?.name || `Player ${player.playerId}`}
                          </Text>
                          {player.eliminated && (
                            <Text style={styles.eliminatedText}>Eliminated</Text>
                          )}
                        </View>
                        <View style={styles.leaderboardScore}>
                          <Text style={styles.scoreText}>
                            {player.score || player.wins || 0} pts
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedTournament.brackets && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Tournament Bracket</Text>
                    <Text style={styles.bracketInfo}>
                      Round {selectedTournament.currentRound || 1} of {selectedTournament.totalRounds || 1}
                    </Text>
                    {/* Simplified bracket view */}
                    <View style={styles.bracketContainer}>
                      {Object.entries(selectedTournament.brackets).map(([round, matches]) => (
                        <View key={round} style={styles.bracketRound}>
                          <Text style={styles.bracketRoundTitle}>Round {round}</Text>
                          {matches.map((match, index) => (
                            <View key={index} style={styles.bracketMatch}>
                              <Text style={styles.matchPlayers}>
                                {match.player1 || 'TBD'} vs {match.player2 || 'TBD'}
                              </Text>
                              {match.winner && (
                                <Text style={styles.matchWinner}>Winner: {match.winner}</Text>
                              )}
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tournaments</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'registration', label: 'Open', icon: 'how-to-reg' },
          { key: 'active', label: 'Live', icon: 'play-circle-filled' },
          { key: 'completed', label: 'Finished', icon: 'emoji-events' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Icon name={tab.icon} size={20} color={selectedTab === tab.key ? '#4CAF50' : '#666'} />
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tournaments.length > 0 ? (
          tournaments.map(renderTournamentCard)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>No Tournaments</Text>
            <Text style={styles.emptyStateText}>
              {selectedTab === 'registration' && 'No tournaments open for registration'}
              {selectedTab === 'active' && 'No tournaments currently active'}
              {selectedTab === 'completed' && 'No completed tournaments to show'}
            </Text>
          </View>
        )}
      </ScrollView>

      {renderTournamentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tournamentCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tournamentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  tournamentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tournamentGame: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tournamentStatus: {},
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tournamentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  tournamentTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  timingText: {
    fontSize: 12,
    color: '#666',
  },
  tournamentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalScroll: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  modalInfoItem: {
    minWidth: '45%',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#16213e',
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardRank: {
    width: 40,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  leaderboardPlayer: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  eliminatedText: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
  },
  leaderboardScore: {},
  scoreText: {
    fontSize: 14,
    color: '#999',
  },
  bracketInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  bracketContainer: {
    gap: 16,
  },
  bracketRound: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
  },
  bracketRoundTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  bracketMatch: {
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  matchPlayers: {
    fontSize: 12,
    color: '#FFF',
  },
  matchWinner: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
  },
});

export default TournamentScreen;
