import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProgressiveJackpotScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('jackpots');
  const [refreshing, setRefreshing] = useState(false);
  const [jackpots, setJackpots] = useState([]);
  const [jackpotHistory, setJackpotHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [topJackpots, setTopJackpots] = useState([]);
  
  // Animation values for jackpot counters
  const [animatedValues] = useState({});

  useEffect(() => {
    fetchAllData();
    // Set up interval to refresh jackpot values every 5 seconds
    const interval = setInterval(fetchJackpots, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchJackpots(),
      fetchHistory(),
      fetchStatistics(),
      fetchTopJackpots()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchJackpots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/jackpots');
      const data = await response.json();
      
      if (data.success) {
        setJackpots(data.jackpots);
        
        // Initialize or update animated values
        data.jackpots.forEach(jackpot => {
          if (!animatedValues[jackpot.id]) {
            animatedValues[jackpot.id] = new Animated.Value(jackpot.currentAmount);
          } else {
            Animated.timing(animatedValues[jackpot.id], {
              toValue: jackpot.currentAmount,
              duration: 1000,
              useNativeDriver: false,
            }).start();
          }
        });
      }
    } catch (error) {
      console.error('Error fetching jackpots:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/jackpots/history?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setJackpotHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching jackpot history:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/jackpots/statistics');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTopJackpots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/jackpots/top?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setTopJackpots(data.topJackpots);
      }
    } catch (error) {
      console.error('Error fetching top jackpots:', error);
    }
  };

  const getTierColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'mega': return '#FF6B35';
      case 'major': return '#F7931E';
      case 'minor': return '#FFD700';
      case 'mini': return '#4CAF50';
      default: return '#999';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier.toLowerCase()) {
      case 'mega': return 'stars';
      case 'major': return 'star';
      case 'minor': return 'star-half';
      case 'mini': return 'star-border';
      default: return 'monetization-on';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const AnimatedJackpotAmount = ({ jackpot }) => {
    const animatedValue = animatedValues[jackpot.id];
    
    if (!animatedValue) {
      return <Text style={styles.jackpotAmount}>{formatCurrency(jackpot.currentAmount)}</Text>;
    }

    return (
      <Animated.View>
        <Text style={styles.jackpotAmount}>
          {formatCurrency(jackpot.currentAmount)}
        </Text>
      </Animated.View>
    );
  };

  const renderJackpotsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Progressive Jackpots</Text>
      
      <View style={styles.jackpotGrid}>
        {jackpots.map((jackpot) => (
          <View key={jackpot.id} style={[styles.jackpotCard, { borderColor: getTierColor(jackpot.tier) }]}>
            <View style={styles.jackpotHeader}>
              <Icon 
                name={getTierIcon(jackpot.tier)} 
                size={24} 
                color={getTierColor(jackpot.tier)} 
              />
              <View style={styles.jackpotInfo}>
                <Text style={[styles.jackpotTier, { color: getTierColor(jackpot.tier) }]}>
                  {jackpot.tier.toUpperCase()}
                </Text>
                <Text style={styles.jackpotGame}>{jackpot.gameType}</Text>
              </View>
            </View>
            
            <AnimatedJackpotAmount jackpot={jackpot} />
            
            <View style={styles.jackpotStats}>
              <View style={styles.jackpotStat}>
                <Icon name="trending-up" size={14} color="#666" />
                <Text style={styles.statText}>
                  +{formatCurrency(jackpot.contributionRate * 100)}/bet
                </Text>
              </View>
              
              <View style={styles.jackpotStat}>
                <Icon name="schedule" size={14} color="#666" />
                <Text style={styles.statText}>
                  {Math.floor((Date.now() - new Date(jackpot.lastWin || jackpot.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                </Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min((jackpot.currentAmount / jackpot.seedAmount) * 50, 100)}%`,
                      backgroundColor: getTierColor(jackpot.tier)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {(jackpot.currentAmount / jackpot.seedAmount * 100).toFixed(1)}% growth
              </Text>
            </View>
          </View>
        ))}
      </View>

      {topJackpots.length > 0 && (
        <View style={styles.topJackpotsSection}>
          <Text style={styles.sectionTitle}>Biggest Jackpots</Text>
          {topJackpots.slice(0, 5).map((jackpot, index) => (
            <View key={`${jackpot.id}-${index}`} style={styles.topJackpotItem}>
              <View style={styles.topJackpotRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.topJackpotInfo}>
                <Text style={styles.topJackpotTier}>{jackpot.tier} - {jackpot.gameType}</Text>
                <Text style={styles.topJackpotAmount}>{formatCurrency(jackpot.currentAmount)}</Text>
              </View>
              <Icon 
                name={getTierIcon(jackpot.tier)} 
                size={20} 
                color={getTierColor(jackpot.tier)} 
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Recent Winners</Text>
      
      {jackpotHistory.length > 0 ? (
        jackpotHistory.map((win, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Icon 
                name="emoji-events" 
                size={24} 
                color={getTierColor(win.tier)} 
              />
              <View style={styles.historyInfo}>
                <Text style={styles.historyTier}>
                  {win.tier.toUpperCase()} JACKPOT
                </Text>
                <Text style={styles.historyGame}>{win.gameType}</Text>
              </View>
              <Text style={styles.historyAmount}>{formatCurrency(win.amount)}</Text>
            </View>
            
            <View style={styles.historyDetails}>
              <Text style={styles.historyWinner}>
                Winner: {win.winner || 'Anonymous'}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(win.timestamp).toLocaleDateString()} at {new Date(win.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Icon name="emoji-events" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No jackpot winners yet</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Jackpot Statistics</Text>
      
      {statistics ? (
        <View style={styles.statisticsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="monetization-on" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>
                {formatCurrency(statistics.totalJackpotValue)}
              </Text>
              <Text style={styles.statLabel}>Total Jackpot Value</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="emoji-events" size={32} color="#FF6B35" />
              <Text style={styles.statValue}>
                {statistics.totalWinners}
              </Text>
              <Text style={styles.statLabel}>Total Winners</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="trending-up" size={32} color="#2196F3" />
              <Text style={styles.statValue}>
                {formatCurrency(statistics.averageJackpot)}
              </Text>
              <Text style={styles.statLabel}>Average Jackpot</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="stars" size={32} color="#FFD700" />
              <Text style={styles.statValue}>
                {formatCurrency(statistics.biggestWin)}
              </Text>
              <Text style={styles.statLabel}>Biggest Win</Text>
            </View>
          </View>

          <View style={styles.tierBreakdown}>
            <Text style={styles.breakdownTitle}>Jackpots by Tier</Text>
            {Object.entries(statistics.jackpotsByTier || {}).map(([tier, count]) => (
              <View key={tier} style={styles.tierBreakdownItem}>
                <Icon 
                  name={getTierIcon(tier)} 
                  size={20} 
                  color={getTierColor(tier)} 
                />
                <Text style={styles.tierBreakdownTier}>{tier.toUpperCase()}</Text>
                <Text style={styles.tierBreakdownCount}>{count} jackpots</Text>
              </View>
            ))}
          </View>

          <View style={styles.gameBreakdown}>
            <Text style={styles.breakdownTitle}>Jackpots by Game</Text>
            {Object.entries(statistics.jackpotsByGame || {}).map(([game, count]) => (
              <View key={game} style={styles.gameBreakdownItem}>
                <Icon name="casino" size={20} color="#999" />
                <Text style={styles.gameBreakdownGame}>{game}</Text>
                <Text style={styles.gameBreakdownCount}>{count} jackpots</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.loadingState}>
          <Icon name="hourglass-empty" size={48} color="#999" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progressive Jackpots</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'jackpots', label: 'Jackpots', icon: 'stars' },
          { key: 'history', label: 'Winners', icon: 'emoji-events' },
          { key: 'stats', label: 'Statistics', icon: 'analytics' }
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

      {selectedTab === 'jackpots' && renderJackpotsTab()}
      {selectedTab === 'history' && renderHistoryTab()}
      {selectedTab === 'stats' && renderStatsTab()}
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
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  jackpotGrid: {
    gap: 16,
  },
  jackpotCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  jackpotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jackpotInfo: {
    marginLeft: 12,
    flex: 1,
  },
  jackpotTier: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  jackpotGame: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  jackpotAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  jackpotStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jackpotStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#999',
  },
  topJackpotsSection: {
    marginTop: 24,
  },
  topJackpotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  topJackpotRank: {
    width: 30,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  topJackpotInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topJackpotTier: {
    fontSize: 12,
    color: '#999',
  },
  topJackpotAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  historyItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTier: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  historyGame: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyDetails: {
    marginLeft: 36,
  },
  historyWinner: {
    fontSize: 12,
    color: '#FFF',
  },
  historyDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  statisticsContainer: {
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  tierBreakdown: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  tierBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierBreakdownTier: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  tierBreakdownCount: {
    fontSize: 14,
    color: '#999',
  },
  gameBreakdown: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  gameBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameBreakdownGame: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  gameBreakdownCount: {
    fontSize: 14,
    color: '#999',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default ProgressiveJackpotScreen;
