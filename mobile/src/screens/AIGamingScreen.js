import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AIGamingScreen = ({ navigation, route }) => {
  const { userId = 'user123' } = route?.params || {};
  const [selectedTab, setSelectedTab] = useState('recommendations');
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [insights, setInsights] = useState(null);
  const [gameRecommendations, setGameRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchBettingRecommendations(),
      fetchUserInsights(),
      fetchGameRecommendations()
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchBettingRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/ai/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentGame: 'blackjack',
          currentBalance: 1000
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendation);
      }
    } catch (error) {
      console.error('Error fetching betting recommendations:', error);
    }
  };

  const fetchUserInsights = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/phase8/ai/insights/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching user insights:', error);
    }
  };

  const fetchGameRecommendations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/phase8/ai/game-recommendations/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setGameRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching game recommendations:', error);
    }
  };

  const trackGameAction = async (gameAction) => {
    try {
      await fetch('http://localhost:5000/api/phase8/ai/track-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, gameAction })
      });
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  };

  const checkFraudulentActivity = async (gameAction) => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/ai/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, gameAction })
      });
      
      const data = await response.json();
      
      if (data.success && data.fraudCheck.isFraudulent) {
        Alert.alert(
          'Security Alert',
          `Suspicious activity detected: ${data.fraudCheck.reason}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error checking fraud:', error);
    }
  };

  const getRiskLevelColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#999';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const renderRecommendationsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>AI Betting Recommendations</Text>
      
      {recommendations ? (
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Icon name="psychology" size={24} color="#4CAF50" />
            <Text style={styles.recommendationTitle}>Smart Betting Strategy</Text>
          </View>
          
          <View style={styles.recommendationContent}>
            <View style={styles.recommendationRow}>
              <Text style={styles.label}>Recommended Bet:</Text>
              <Text style={styles.value}>${recommendations.recommendedBet}</Text>
            </View>
            
            <View style={styles.recommendationRow}>
              <Text style={styles.label}>Risk Level:</Text>
              <Text style={[styles.value, { color: getRiskLevelColor(recommendations.riskLevel) }]}>
                {recommendations.riskLevel}
              </Text>
            </View>
            
            <View style={styles.recommendationRow}>
              <Text style={styles.label}>Confidence:</Text>
              <Text style={[styles.value, { color: getConfidenceColor(recommendations.confidence) }]}>
                {(recommendations.confidence * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.reasonContainer}>
              <Text style={styles.label}>AI Analysis:</Text>
              <Text style={styles.reason}>{recommendations.reason}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => {
              trackGameAction({
                action: 'apply_ai_recommendation',
                recommendedBet: recommendations.recommendedBet,
                timestamp: Date.now()
              });
              Alert.alert('Applied', 'AI recommendation has been applied to your betting strategy');
            }}
          >
            <Text style={styles.applyButtonText}>Apply Recommendation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingCard}>
          <Icon name="hourglass-empty" size={48} color="#999" />
          <Text style={styles.loadingText}>Analyzing your gaming patterns...</Text>
        </View>
      )}

      <View style={styles.gameRecommendationsSection}>
        <Text style={styles.sectionTitle}>Recommended Games for You</Text>
        
        {gameRecommendations.map((game, index) => (
          <View key={index} style={styles.gameRecommendationCard}>
            <View style={styles.gameRecommendationHeader}>
              <Icon name="casino" size={20} color="#4CAF50" />
              <Text style={styles.gameRecommendationTitle}>{game.game}</Text>
              <Text style={[styles.gameScore, { color: getConfidenceColor(game.score) }]}>
                {(game.score * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.gameRecommendationReason}>{game.reason}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Your Gaming Insights</Text>
      
      {insights ? (
        <View style={styles.insightsContainer}>
          {/* Gaming Pattern Analysis */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="trending-up" size={24} color="#2196F3" />
              <Text style={styles.insightTitle}>Gaming Pattern</Text>
            </View>
            <Text style={styles.insightDescription}>{insights.gamingPattern}</Text>
          </View>

          {/* Risk Assessment */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="security" size={24} color={getRiskLevelColor(insights.riskAssessment)} />
              <Text style={styles.insightTitle}>Risk Profile</Text>
            </View>
            <Text style={[styles.insightValue, { color: getRiskLevelColor(insights.riskAssessment) }]}>
              {insights.riskAssessment} Risk Player
            </Text>
            <Text style={styles.insightDescription}>
              Based on your betting patterns and game choices
            </Text>
          </View>

          {/* Personalized Tips */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="lightbulb" size={24} color="#FF9800" />
              <Text style={styles.insightTitle}>Personalized Tips</Text>
            </View>
            {insights.personalizedTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Performance Metrics */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="analytics" size={24} color="#9C27B0" />
              <Text style={styles.insightTitle}>Performance Metrics</Text>
            </View>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{insights.totalGamesPlayed}</Text>
                <Text style={styles.metricLabel}>Games Played</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: insights.winRate >= 0.5 ? '#4CAF50' : '#F44336' }]}>
                  {(insights.winRate * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricLabel}>Win Rate</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>${insights.averageBet.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Avg Bet</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: insights.profitLoss >= 0 ? '#4CAF50' : '#F44336' }]}>
                  ${insights.profitLoss.toFixed(2)}
                </Text>
                <Text style={styles.metricLabel}>P&L</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loadingCard}>
          <Icon name="analytics" size={48} color="#999" />
          <Text style={styles.loadingText}>Generating personalized insights...</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderSecurityTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>AI Security Monitor</Text>
      
      <View style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Icon name="shield" size={24} color="#4CAF50" />
          <Text style={styles.securityTitle}>Account Security Status</Text>
          <Text style={styles.securityStatus}>PROTECTED</Text>
        </View>
        
        <Text style={styles.securityDescription}>
          Our AI continuously monitors your account for suspicious activities and ensures fair play.
        </Text>
        
        <View style={styles.securityFeatures}>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Real-time fraud detection</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Behavioral pattern analysis</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Responsible gaming alerts</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Automated risk assessment</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.testSecurityButton}
          onPress={() => {
            checkFraudulentActivity({
              action: 'security_test',
              timestamp: Date.now(),
              unusual_pattern: true
            });
          }}
        >
          <Text style={styles.testSecurityButtonText}>Test Security System</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.responsibleGamingCard}>
        <View style={styles.responsibleGamingHeader}>
          <Icon name="favorite" size={24} color="#E91E63" />
          <Text style={styles.responsibleGamingTitle}>Responsible Gaming</Text>
        </View>
        
        <Text style={styles.responsibleGamingDescription}>
          Our AI helps you maintain healthy gaming habits by monitoring your behavior and providing timely interventions.
        </Text>
        
        <TouchableOpacity style={styles.responsibleGamingButton}>
          <Text style={styles.responsibleGamingButtonText}>Set Gaming Limits</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Gaming Assistant</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'recommendations', label: 'Recommendations', icon: 'psychology' },
          { key: 'insights', label: 'Insights', icon: 'analytics' },
          { key: 'security', label: 'Security', icon: 'shield' }
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

      {selectedTab === 'recommendations' && renderRecommendationsTab()}
      {selectedTab === 'insights' && renderInsightsTab()}
      {selectedTab === 'security' && renderSecurityTab()}
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
  recommendationCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  recommendationContent: {
    gap: 12,
  },
  recommendationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#999',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  reasonContainer: {
    marginTop: 8,
  },
  reason: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  gameRecommendationsSection: {
    marginTop: 24,
  },
  gameRecommendationCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  gameRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameRecommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  gameScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameRecommendationReason: {
    fontSize: 12,
    color: '#999',
    marginLeft: 28,
  },
  insightsContainer: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    alignItems: 'center',
    minWidth: '40%',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  securityCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginLeft: 8,
  },
  securityStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  securityFeatures: {
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
  },
  testSecurityButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testSecurityButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  responsibleGamingCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  responsibleGamingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responsibleGamingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  responsibleGamingDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  responsibleGamingButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  responsibleGamingButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AIGamingScreen;
