import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const CrapsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [dice, setDice] = useState([1, 1]);
  const [point, setPoint] = useState(null);
  const [phase, setPhase] = useState('comeOut');
  const [bets, setBets] = useState({});
  const [betAmount, setBetAmount] = useState(5);
  const [rollHistory, setRollHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollAnimation = new Animated.Value(0);

  const rollDice = async () => {
    if (!user || Object.keys(bets).length === 0) {
      Alert.alert('Error', 'Please place a bet first');
      return;
    }

    setIsRolling(true);
    
    // Animate dice roll
    Animated.sequence([
      Animated.timing(rollAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rollAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const response = await fetch('http://localhost:5000/api/phase4games/craps/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ bets, point, phase })
      });

      const data = await response.json();
      
      if (data.success) {
        setDice(data.dice);
        setPoint(data.point);
        setPhase(data.phase);
        setRollHistory([...rollHistory, { dice: data.dice, total: data.total }]);
        setBets({});
        
        if (data.results && data.results.length > 0) {
          const totalWinnings = data.results.reduce((sum, result) => sum + result.payout, 0);
          if (totalWinnings > 0) {
            Alert.alert('Winner!', `You won $${totalWinnings}!`);
          } else {
            Alert.alert('Better luck next time!', 'You lost this round.');
          }
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to roll dice');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsRolling(false);
    }
  };

  const placeBet = (betType) => {
    if (bets[betType]) {
      setBets({ ...bets, [betType]: bets[betType] + betAmount });
    } else {
      setBets({ ...bets, [betType]: betAmount });
    }
  };

  const clearBets = () => {
    setBets({});
  };

  const getDiceEmoji = (value) => {
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceEmojis[value - 1];
  };

  const getBetDescription = (betType) => {
    const descriptions = {
      'pass': 'Pass Line - Win on 7/11, lose on 2/3/12',
      'dontPass': "Don't Pass - Opposite of Pass Line",
      'field': 'Field - Win on 2,3,4,9,10,11,12',
      'any7': 'Any Seven - Win if next roll is 7',
      'anycraps': 'Any Craps - Win on 2,3,12',
      'hardways6': 'Hard 6 - Win on 3+3',
      'hardways8': 'Hard 8 - Win on 4+4'
    };
    return descriptions[betType] || betType;
  };

  const renderDice = () => (
    <Animated.View 
      style={[
        styles.diceContainer,
        {
          transform: [{
            rotate: rollAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg']
            })
          }]
        }
      ]}
    >
      <View style={styles.dice}>
        <Text style={styles.diceText}>{getDiceEmoji(dice[0])}</Text>
      </View>
      <View style={styles.dice}>
        <Text style={styles.diceText}>{getDiceEmoji(dice[1])}</Text>
      </View>
      <Text style={styles.diceTotal}>Total: {dice[0] + dice[1]}</Text>
    </Animated.View>
  );

  const renderBetButton = (betType, label, payout = '1:1') => (
    <TouchableOpacity
      key={betType}
      style={[styles.betButton, bets[betType] && styles.activeBet]}
      onPress={() => placeBet(betType)}
    >
      <Text style={styles.betButtonText}>{label}</Text>
      <Text style={styles.betPayout}>{payout}</Text>
      {bets[betType] && (
        <Text style={styles.betAmount}>${bets[betType]}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Craps</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.phaseText}>
          Phase: {phase === 'comeOut' ? 'Come Out' : `Point: ${point}`}
        </Text>
      </View>

      {renderDice()}

      <View style={styles.betAmountContainer}>
        <Text style={styles.betAmountLabel}>Bet Amount:</Text>
        <View style={styles.betAmountButtons}>
          {[5, 10, 25, 50].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.betAmountButton, betAmount === amount && styles.activeBetAmount]}
              onPress={() => setBetAmount(amount)}
            >
              <Text style={[styles.betAmountText, betAmount === amount && styles.activeBetAmountText]}>
                ${amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bettingArea}>
        <Text style={styles.sectionTitle}>Place Your Bets</Text>
        
        <View style={styles.betRow}>
          {renderBetButton('pass', 'Pass Line', '1:1')}
          {renderBetButton('dontPass', "Don't Pass", '1:1')}
        </View>

        <View style={styles.betRow}>
          {renderBetButton('field', 'Field', '1:1')}
          {renderBetButton('any7', 'Any 7', '4:1')}
        </View>

        <View style={styles.betRow}>
          {renderBetButton('anycraps', 'Any Craps', '7:1')}
          {renderBetButton('hardways6', 'Hard 6', '9:1')}
        </View>

        <View style={styles.betRow}>
          {renderBetButton('hardways8', 'Hard 8', '9:1')}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.rollButton, isRolling && styles.disabledButton]} 
          onPress={rollDice}
          disabled={isRolling}
        >
          <Text style={styles.rollButtonText}>
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearBets}>
          <Text style={styles.clearButtonText}>Clear Bets</Text>
        </TouchableOpacity>
      </View>

      {rollHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Rolls</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rollHistory.slice(-10).map((roll, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDice}>
                  {getDiceEmoji(roll.dice[0])} {getDiceEmoji(roll.dice[1])}
                </Text>
                <Text style={styles.historyTotal}>{roll.total}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Quick Rules</Text>
        <Text style={styles.rulesText}>
          • Pass Line: Win on 7/11, lose on 2/3/12{'\n'}
          • Field: Win on 2,3,4,9,10,11,12{'\n'}
          • Any 7: Win if next roll totals 7{'\n'}
          • Any Craps: Win on 2,3,12{'\n'}
          • Hard Ways: Win on doubles (3+3, 4+4)
        </Text>
      </View>
    </ScrollView>
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
  gameInfo: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    borderRadius: 10,
  },
  phaseText: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  diceContainer: {
    alignItems: 'center',
    padding: 20,
  },
  dice: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  diceText: {
    fontSize: 40,
  },
  diceTotal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  betAmountContainer: {
    padding: 20,
    alignItems: 'center',
  },
  betAmountLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  betAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  betAmountButton: {
    backgroundColor: '#4a4a4a',
    padding: 10,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  activeBetAmount: {
    backgroundColor: '#ffd700',
  },
  betAmountText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeBetAmountText: {
    color: '#2e7d2e',
  },
  bettingArea: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  betRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  betButton: {
    backgroundColor: '#2e7d2e',
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    margin: 5,
  },
  activeBet: {
    backgroundColor: '#ffd700',
  },
  betButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  betPayout: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  betAmount: {
    color: '#2e7d2e',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  rollButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  rollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    padding: 20,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  historyDice: {
    fontSize: 20,
  },
  historyTotal: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  rulesContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    borderRadius: 10,
  },
  rulesTitle: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rulesText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CrapsScreen;
