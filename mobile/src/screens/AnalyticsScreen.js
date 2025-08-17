import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
  Modal
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const AnalyticsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [timeframe, setTimeframe] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [gameStats, setGameStats] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/user/${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
        setGameStats(data.gameStats);
        setSessionHistory(data.sessionHistory);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data for demonstration
      setAnalytics({
        totalGames: 145,
        totalWinnings: 2450,
        totalLosses: 1890,
        netProfit: 560,
        winRate: 62.8,
        averageSession: 45,
        longestWinStreak: 8,
        longestLossStreak: 3,
        favoriteGame: 'Texas Hold\'em',
        totalTimeSpent: 1320, // minutes
        biggestWin: 850,
        biggestLoss: 200
      });

      setGameStats([
        { game: 'Texas Hold\'em', played: 45, won: 28, winRate: 62.2, profit: 340 },
        { game: 'Blackjack', played: 32, won: 21, winRate: 65.6, profit: 180 },
        { game: 'Slots', played: 28, won: 15, winRate: 53.6, profit: -45 },
        { game: 'Roulette', played: 20, won: 11, winRate: 55.0, profit: 90 },
        { game: 'Baccarat', played: 12, won: 8, winRate: 66.7, profit: 120 },
        { game: 'Craps', played: 8, won: 4, winRate: 50.0, profit: -25 }
      ]);

      setSessionHistory([
        { date: '2025-08-17', duration: 62, games: 8, profit: 145, winRate: 75 },
        { date: '2025-08-16', duration: 38, games: 5, profit: -85, winRate: 40 },
        { date: '2025-08-15', duration: 71, games: 12, profit: 230, winRate: 66.7 },
        { date: '2025-08-14', duration: 25, games: 3, profit: 95, winRate: 100 },
        { date: '2025-08-13', duration: 55, games: 9, profit: -45, winRate: 44.4 }
      ]);
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 60) return '#4CAF50';
    if (winRate >= 45) return '#ff9800';
    return '#f44336';
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? '#4CAF50' : '#f44336';
  };

  const renderStatCard = (title, value, subtitle, color = '#fff') => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderGameStat = ({ item }) => (
    <TouchableOpacity 
      style={styles.gameStatCard}
      onPress={() => {
        setSelectedGame(item);
        setShowDetails(true);
      }}
    >
      <View style={styles.gameStatHeader}>
        <Text style={styles.gameStatName}>{item.game}</Text>
        <Text style={[styles.gameStatProfit, { color: getProfitColor(item.profit) }]}>
          {item.profit >= 0 ? '+' : ''}${item.profit}
        </Text>
      </View>
      
      <View style={styles.gameStatRow}>
        <Text style={styles.gameStatLabel}>Games: {item.played}</Text>
        <Text style={styles.gameStatLabel}>Won: {item.won}</Text>
      </View>
      
      <View style={styles.winRateContainer}>
        <Text style={styles.winRateLabel}>Win Rate:</Text>
        <View style={styles.winRateBar}>
          <View 
            style={[
              styles.winRateFill, 
              { 
                width: `${item.winRate}%`,
                backgroundColor: getWinRateColor(item.winRate)
              }
            ]} 
          />
        </View>
        <Text style={[styles.winRateText, { color: getWinRateColor(item.winRate) }]}>
          {item.winRate}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSessionHistory = ({ item }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{item.date}</Text>
        <Text style={[styles.sessionProfit, { color: getProfitColor(item.profit) }]}>
          {item.profit >= 0 ? '+' : ''}${item.profit}
        </Text>
      </View>
      
      <View style={styles.sessionStats}>
        <Text style={styles.sessionStat}>🎮 {item.games} games</Text>
        <Text style={styles.sessionStat}>⏱️ {item.duration}m</Text>
        <Text style={[styles.sessionStat, { color: getWinRateColor(item.winRate) }]}>
          🏆 {item.winRate}%
        </Text>
      </View>
    </View>
  );

  const renderChart = () => {
    const chartHeight = 120;
    const maxProfit = Math.max(...sessionHistory.map(s => Math.abs(s.profit)));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Session Profit/Loss Trend</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {sessionHistory.map((session, index) => {
            const barHeight = Math.abs(session.profit) / maxProfit * (chartHeight - 20);
            const isProfit = session.profit >= 0;
            
            return (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isProfit ? '#4CAF50' : '#f44336',
                      alignSelf: isProfit ? 'flex-end' : 'flex-start'
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>
                  {session.date.slice(-2)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!analytics) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {['day', 'week', 'month', 'year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.timeframeButton, timeframe === period && styles.activeTimeframe]}
            onPress={() => setTimeframe(period)}
          >
            <Text style={[styles.timeframeText, timeframe === period && styles.activeTimeframeText]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overview Stats */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('Total Games', analytics.totalGames, 'Games played')}
          {renderStatCard('Net Profit', `$${analytics.netProfit}`, 'Total earnings', getProfitColor(analytics.netProfit))}
          {renderStatCard('Win Rate', `${analytics.winRate}%`, 'Success rate', getWinRateColor(analytics.winRate))}
          {renderStatCard('Avg Session', `${analytics.averageSession}m`, 'Play time')}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>🎯 Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Biggest Win</Text>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
              ${analytics.biggestWin}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Win Streak</Text>
            <Text style={[styles.metricValue, { color: '#ffd700' }]}>
              {analytics.longestWinStreak}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Favorite Game</Text>
            <Text style={styles.metricValue}>
              {analytics.favoriteGame}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Time</Text>
            <Text style={styles.metricValue}>
              {Math.floor(analytics.totalTimeSpent / 60)}h {analytics.totalTimeSpent % 60}m
            </Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Game Stats */}
      <View style={styles.gameStatsSection}>
        <Text style={styles.sectionTitle}>🎮 Game Performance</Text>
        <FlatList
          data={gameStats}
          renderItem={renderGameStat}
          keyExtractor={(item) => item.game}
          scrollEnabled={false}
        />
      </View>

      {/* Session History */}
      <View style={styles.sessionSection}>
        <Text style={styles.sectionTitle}>📈 Recent Sessions</Text>
        <FlatList
          data={sessionHistory}
          renderItem={renderSessionHistory}
          keyExtractor={(item) => item.date}
          scrollEnabled={false}
        />
      </View>

      {/* Game Details Modal */}
      <Modal visible={showDetails} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.detailsModal}>
            {selectedGame && (
              <>
                <Text style={styles.modalTitle}>{selectedGame.game} Details</Text>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Games Played:</Text>
                    <Text style={styles.detailValue}>{selectedGame.played}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Games Won:</Text>
                    <Text style={styles.detailValue}>{selectedGame.won}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Win Rate:</Text>
                    <Text style={[styles.detailValue, { color: getWinRateColor(selectedGame.winRate) }]}>
                      {selectedGame.winRate}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Profit:</Text>
                    <Text style={[styles.detailValue, { color: getProfitColor(selectedGame.profit) }]}>
                      ${selectedGame.profit}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowDetails(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1a1e',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
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
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a2f36',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTimeframe: {
    backgroundColor: '#ffd700',
  },
  timeframeText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTimeframeText: {
    color: '#1a2f36',
  },
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  statTitle: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    color: '#999',
    fontSize: 10,
  },
  metricsSection: {
    padding: 20,
    paddingTop: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#ccc',
    fontSize: 11,
    marginBottom: 3,
  },
  metricValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 20,
    paddingTop: 0,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 5,
  },
  chartLabel: {
    color: '#ccc',
    fontSize: 10,
  },
  gameStatsSection: {
    padding: 20,
    paddingTop: 0,
  },
  gameStatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  gameStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameStatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameStatProfit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameStatLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  winRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winRateLabel: {
    color: '#ccc',
    fontSize: 12,
    marginRight: 8,
  },
  winRateBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 8,
  },
  winRateFill: {
    height: '100%',
    borderRadius: 3,
  },
  winRateText: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 35,
  },
  sessionSection: {
    padding: 20,
    paddingTop: 0,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sessionDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionProfit: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sessionStat: {
    color: '#ccc',
    fontSize: 11,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModal: {
    backgroundColor: '#1a2f36',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsGrid: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AnalyticsScreen;
