import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const BaccaratScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [playerHand, setPlayerHand] = useState([]);
  const [bankerHand, setBankerHand] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [betType, setBetType] = useState('player');
  const [gameState, setGameState] = useState('betting');
  const [result, setResult] = useState(null);

  const cardSuits = { 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠' };

  const dealCards = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to play');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/phase4games/baccarat/deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ betType, betAmount })
      });

      const data = await response.json();
      
      if (data.success) {
        setPlayerHand(data.playerHand);
        setBankerHand(data.bankerHand);
        setResult(data.result);
        setGameState('complete');
      } else {
        Alert.alert('Error', data.error || 'Failed to deal cards');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setResult(null);
    setGameState('betting');
  };

  const renderCard = (card, index) => (
    <View key={index} style={styles.card}>
      <Text style={[styles.cardText, { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#e74c3c' : '#2c3e50' }]}>
        {card.value} {cardSuits[card.suit]}
      </Text>
    </View>
  );

  const renderHand = (hand, title) => (
    <View style={styles.handContainer}>
      <Text style={styles.handTitle}>{title}</Text>
      <View style={styles.cardsRow}>
        {hand.map(renderCard)}
      </View>
      {hand.length > 0 && (
        <Text style={styles.handTotal}>
          Total: {hand.reduce((sum, card) => {
            let value = parseInt(card.value);
            if (isNaN(value)) value = card.value === 'A' ? 1 : 0;
            return (sum + value) % 10;
          }, 0)}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Baccarat</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      {gameState === 'betting' && (
        <View style={styles.bettingSection}>
          <Text style={styles.sectionTitle}>Place Your Bet</Text>
          
          <View style={styles.betTypeContainer}>
            {['player', 'banker', 'tie'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.betTypeButton, betType === type && styles.activeBetType]}
                onPress={() => setBetType(type)}
              >
                <Text style={[styles.betTypeText, betType === type && styles.activeBetTypeText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.betAmountContainer}>
            {[5, 10, 25, 50, 100].map((amount) => (
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

          <TouchableOpacity style={styles.dealButton} onPress={dealCards}>
            <Text style={styles.dealButtonText}>Deal Cards</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'complete' && (
        <View style={styles.gameArea}>
          {renderHand(playerHand, 'Player')}
          {renderHand(bankerHand, 'Banker')}
          
          {result && (
            <View style={styles.resultContainer}>
              <Text style={[styles.resultText, result.winner === betType ? styles.winText : styles.loseText]}>
                {result.winner.charAt(0).toUpperCase() + result.winner.slice(1)} Wins!
              </Text>
              <Text style={styles.payoutText}>
                {result.winner === betType ? `Won: $${result.payout}` : `Lost: $${betAmount}`}
              </Text>
              
              <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play</Text>
        <Text style={styles.rulesText}>
          • Choose Player, Banker, or Tie bet{'\n'}
          • Cards are dealt automatically{'\n'}
          • Closest to 9 wins{'\n'}
          • Player/Banker pay 1:1, Tie pays 8:1
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
  bettingSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  betTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  betTypeButton: {
    backgroundColor: '#2e7d2e',
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  activeBetType: {
    backgroundColor: '#ffd700',
  },
  betTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeBetTypeText: {
    color: '#2e7d2e',
  },
  betAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  betAmountButton: {
    backgroundColor: '#4a4a4a',
    padding: 10,
    borderRadius: 6,
    margin: 5,
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
  dealButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  dealButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    padding: 20,
  },
  handContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  handTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  handTotal: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginTop: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  winText: {
    color: '#4CAF50',
  },
  loseText: {
    color: '#f44336',
  },
  payoutText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
  },
  playAgainButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 30,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default BaccaratScreen;
