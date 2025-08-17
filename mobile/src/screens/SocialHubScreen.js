import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import socketService from '../services/SocketService';

const SocialHubScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadSocialData();
    connectSocket();
  }, []);

  const connectSocket = async () => {
    try {
      await socketService.connect();
      
      socketService.on('friend-request', (request) => {
        setFriendRequests(prev => [...prev, request]);
        Alert.alert('Friend Request', `${request.fromUser.username} wants to be your friend!`);
      });

      socketService.on('friend-accepted', (friend) => {
        setFriends(prev => [...prev, friend]);
        Alert.alert('Friend Added', `You are now friends with ${friend.username}!`);
      });

      socketService.on('achievement-unlocked', (achievement) => {
        setAchievements(prev => [...prev, achievement]);
        Alert.alert('Achievement Unlocked!', achievement.name);
      });

      socketService.on('social-notification', (notification) => {
        setNotifications(prev => [...prev, notification]);
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const loadSocialData = async () => {
    await Promise.all([
      loadFriends(),
      loadFriendRequests(),
      loadLeaderboard(),
      loadAchievements(),
      loadNotifications()
    ]);
  };

  const loadFriends = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/friends', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      // Mock data for demonstration
      setFriends([
        { id: 1, username: 'PokerPro123', status: 'online', lastGame: 'Texas Hold\'em', wins: 45 },
        { id: 2, username: 'SlotMaster', status: 'offline', lastGame: 'Mega Fortune', wins: 12 },
        { id: 3, username: 'BlackjackKing', status: 'in-game', lastGame: 'Live Blackjack', wins: 28 },
      ]);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/friend-requests', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFriendRequests(data.requests);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
      // Mock data
      setFriendRequests([
        { id: 1, fromUser: { username: 'CasinoNewbie', id: 101 }, createdAt: new Date() }
      ]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/leaderboard', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Mock data
      setLeaderboard([
        { rank: 1, username: 'HighRoller99', totalWinnings: 15420, gamesPlayed: 234 },
        { rank: 2, username: 'LuckyLady', totalWinnings: 12890, gamesPlayed: 189 },
        { rank: 3, username: 'CardShark', totalWinnings: 11650, gamesPlayed: 156 },
        { rank: 4, username: 'PokerFace', totalWinnings: 9870, gamesPlayed: 178 },
        { rank: 5, username: user?.username || 'YourName', totalWinnings: 8550, gamesPlayed: 145 },
      ]);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/achievements', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Mock data
      setAchievements([
        { id: 1, name: 'First Win', description: 'Win your first game', icon: '🏆', unlocked: true },
        { id: 2, name: 'Big Winner', description: 'Win over $1000 in a single game', icon: '💰', unlocked: true },
        { id: 3, name: 'Social Butterfly', description: 'Add 5 friends', icon: '👥', unlocked: false },
        { id: 4, name: 'Poker Pro', description: 'Win 10 poker games', icon: '♠️', unlocked: true },
        { id: 5, name: 'Slot Machine', description: 'Play 100 slot games', icon: '🎰', unlocked: false },
        { id: 6, name: 'Lucky Seven', description: 'Win 7 games in a row', icon: '🍀', unlocked: false },
      ]);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/social/notifications', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Mock data
      setNotifications([
        { id: 1, type: 'friend_win', message: 'PokerPro123 just won $500 in Live Blackjack!', time: '2 min ago' },
        { id: 2, type: 'achievement', message: 'You unlocked the "Big Winner" achievement!', time: '1 hour ago' },
        { id: 3, type: 'tournament', message: 'Daily Tournament starts in 30 minutes', time: '3 hours ago' },
      ]);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/social/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ username: searchUsername })
      });
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Friend request sent!');
        setSearchUsername('');
        setShowAddFriend(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to send friend request');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/social/friend-request/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        loadFriends(); // Reload friends list
        Alert.alert('Success', 'Friend request accepted!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/social/friend-request/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        Alert.alert('Success', 'Friend request rejected');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
        <Text style={styles.friendStatus}>
          {item.status === 'online' ? '🟢 Online' : 
           item.status === 'in-game' ? '🎮 In Game' : '⚫ Offline'}
        </Text>
        <Text style={styles.friendGame}>Last: {item.lastGame}</Text>
      </View>
      <View style={styles.friendStats}>
        <Text style={styles.friendWins}>🏆 {item.wins}</Text>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.requestUser}>{item.fromUser.username}</Text>
      <Text style={styles.requestTime}>wants to be your friend</Text>
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => acceptFriendRequest(item.id)}
        >
          <Text style={styles.requestButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.requestButton, styles.rejectButton]}
          onPress={() => rejectFriendRequest(item.id)}
        >
          <Text style={styles.requestButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboardItem = ({ item }) => (
    <View style={[styles.leaderboardCard, item.username === user?.username && styles.currentUser]}>
      <Text style={styles.rank}>#{item.rank}</Text>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <Text style={styles.playerStats}>
          ${item.totalWinnings} • {item.gamesPlayed} games
        </Text>
      </View>
      {item.rank <= 3 && (
        <Text style={styles.medal}>
          {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
        </Text>
      )}
    </View>
  );

  const renderAchievement = ({ item }) => (
    <View style={[styles.achievementCard, !item.unlocked && styles.lockedAchievement]}>
      <Text style={styles.achievementIcon}>{item.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementName}>{item.name}</Text>
        <Text style={styles.achievementDesc}>{item.description}</Text>
      </View>
      {item.unlocked ? (
        <Text style={styles.unlockedBadge}>✅</Text>
      ) : (
        <Text style={styles.lockedBadge}>🔒</Text>
      )}
    </View>
  );

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <View style={styles.tabContent}>
            {friendRequests.length > 0 && (
              <View style={styles.requestsSection}>
                <Text style={styles.sectionTitle}>Friend Requests</Text>
                <FlatList
                  data={friendRequests}
                  renderItem={renderFriendRequest}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}
            
            <View style={styles.friendsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddFriend(true)}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={friends}
                renderItem={renderFriend}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        );

      case 'leaderboard':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🏆 Weekly Leaderboard</Text>
            <FlatList
              data={leaderboard}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => item.rank.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🏅 Your Achievements</Text>
            <FlatList
              data={achievements}
              renderItem={renderAchievement}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🔔 Recent Activity</Text>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Social Hub</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'friends', label: '👥 Friends', count: friends.length },
          { key: 'leaderboard', label: '🏆 Ranks', count: null },
          { key: 'achievements', label: '🏅 Badges', count: achievements.filter(a => a.unlocked).length },
          { key: 'notifications', label: '🔔 Activity', count: notifications.length }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.count !== null && tab.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal visible={showAddFriend} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.addFriendModal}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TextInput
              style={styles.usernameInput}
              value={searchUsername}
              onChangeText={setSearchUsername}
              placeholder="Enter username"
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddFriend(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendFriendRequest}
              >
                <Text style={styles.modalButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a2f36',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#ffd700',
  },
  tabText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#ffd700',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  friendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  friendStatus: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
  friendGame: {
    color: '#999',
    fontSize: 11,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendWins: {
    color: '#ffd700',
    fontSize: 12,
    marginBottom: 5,
  },
  inviteButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestUser: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  requestTime: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUser: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  rank: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
    minWidth: 30,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerStats: {
    color: '#ccc',
    fontSize: 12,
  },
  medal: {
    fontSize: 24,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementDesc: {
    color: '#ccc',
    fontSize: 12,
  },
  unlockedBadge: {
    fontSize: 20,
  },
  lockedBadge: {
    fontSize: 16,
    opacity: 0.5,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  notificationMessage: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  notificationTime: {
    color: '#999',
    fontSize: 11,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendModal: {
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
    marginBottom: 15,
  },
  usernameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SocialHubScreen;
