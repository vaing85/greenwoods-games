import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const VideoPokerScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [hand, setHand] = useState([]);
  const [heldCards, setHeldCards] = useState([]);
  const [gameState, setGameState] = useState('betting');
  const [betAmount, setBetAmount] = useState(5);
  const [variant, setVariant] = useState('jacksOrBetter');
  const [credits, setCredits] = useState(100);
  const [showPaytable, setShowPaytable] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const cardSuits = { 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠' };

  const variants = {
    jacksOrBetter: 'Jacks or Better',
    deucesWild: 'Deuces Wild',
    bonusPoker: 'Bonus Poker'
  };

  const paytables = {
    jacksOrBetter: {
      'Royal Flush': 800,
      'Straight Flush': 50,
      'Four of a Kind': 25,
      'Full House': 9,
      'Flush': 6,
      'Straight': 4,
      'Three of a Kind': 3,
      'Two Pair': 2,
      'Jacks or Better': 1
    },
    deucesWild: {
      'Natural Royal': 800,
      'Four Deuces': 200,
      'Wild Royal': 25,
      'Five of a Kind': 15,
      'Straight Flush': 9,
      'Four of a Kind': 5,
      'Full House': 3,
      'Flush': 2,
      'Straight': 2,
      'Three of a Kind': 1
    },
    bonusPoker: {
      'Royal Flush': 800,
      'Straight Flush': 50,
      'Four Aces': 80,
      'Four 2s-4s': 40,
      'Four 5s-Ks': 25,
      'Full House': 8,
      'Flush': 5,
      'Straight': 4,
      'Three of a Kind': 3,
      'Two Pair': 2,
      'Jacks or Better': 1
    }
  };

  const dealCards = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to play');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/phase4games/video-poker/deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ variant, betAmount })
      });

      const data = await response.json();
      
      if (data.success) {
        setHand(data.hand);
        setHeldCards([]);
        setGameState('holding');
        setLastResult(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to deal cards');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const drawCards = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase4games/video-poker/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          hand, 
          heldCards, 
          variant, 
          betAmount 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHand(data.finalHand);
        setLastResult(data.result);
        setGameState('complete');
        
        if (data.result.payout > 0) {
          Alert.alert('Winner!', `${data.result.handType} - Won $${data.result.payout}!`);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to draw cards');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const toggleHoldCard = (index) => {
    if (heldCards.includes(index)) {
      setHeldCards(heldCards.filter(i => i !== index));
    } else {
      setHeldCards([...heldCards, index]);
    }
  };

  const newGame = () => {
    setHand([]);
    setHeldCards([]);
    setGameState('betting');
    setLastResult(null);
  };

  const renderCard = (card, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.card,
        heldCards.includes(index) && styles.heldCard
      ]}
      onPress={() => gameState === 'holding' && toggleHoldCard(index)}
      disabled={gameState !== 'holding'}
    >
      <Text style={[
        styles.cardText,
        { color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#e74c3c' : '#2c3e50' }
      ]}>
        {card.value} {cardSuits[card.suit]}
      </Text>
      {heldCards.includes(index) && (
        <Text style={styles.heldText}>HELD</Text>
      )}
    </TouchableOpacity>
  );

  const renderPaytable = () => (
    <Modal visible={showPaytable} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.paytableContainer}>
          <Text style={styles.paytableTitle}>{variants[variant]} Paytable</Text>
          <ScrollView>
            {Object.entries(paytables[variant]).map(([hand, payout]) => (
              <View key={hand} style={styles.paytableRow}>
                <Text style={styles.paytableHand}>{hand}</Text>
                <Text style={styles.paytablePayout}>{payout}:1</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPaytable(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Video Poker</Text>
        <Text style={styles.balance}>Balance: ${user?.balance || 0}</Text>
      </View>

      {gameState === 'betting' && (
        <View style={styles.bettingSection}>
          <Text style={styles.sectionTitle}>Select Game & Bet</Text>
          
          <View style={styles.variantContainer}>
            {Object.entries(variants).map(([key, name]) => (
              <TouchableOpacity
                key={key}
                style={[styles.variantButton, variant === key && styles.activeVariant]}
                onPress={() => setVariant(key)}
              >
                <Text style={[styles.variantText, variant === key && styles.activeVariantText]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.paytableButton} 
            onPress={() => setShowPaytable(true)}
          >
            <Text style={styles.paytableButtonText}>View Paytable</Text>
          </TouchableOpacity>

          <View style={styles.betAmountContainer}>
            <Text style={styles.betLabel}>Bet Amount:</Text>
            {[1, 2, 5, 10, 25].map((amount) => (
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

      {(gameState === 'holding' || gameState === 'complete') && (
        <View style={styles.gameArea}>
          <Text style={styles.gameInstruction}>
            {gameState === 'holding' 
              ? 'Tap cards to hold, then draw'
              : lastResult 
                ? `${lastResult.handType} - ${lastResult.payout > 0 ? `Won $${lastResult.payout}` : 'No win'}`
                : 'Game complete'
            }
          </Text>
          
          <View style={styles.handContainer}>
            {hand.map(renderCard)}
          </View>

          {gameState === 'holding' && (
            <TouchableOpacity style={styles.drawButton} onPress={drawCards}>
              <Text style={styles.drawButtonText}>Draw Cards</Text>
            </TouchableOpacity>
          )}

          {gameState === 'complete' && (
            <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
              <Text style={styles.newGameButtonText}>New Game</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play</Text>
        <Text style={styles.rulesText}>
          • Choose your variant and bet amount{'\n'}
          • Get 5 cards, select which to hold{'\n'}
          • Draw replacement cards{'\n'}
          • Win based on poker hand strength{'\n'}
          • Tap "View Paytable" for payouts
        </Text>
      </View>

      {renderPaytable()}
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
  variantContainer: {
    marginBottom: 20,
  },
  variantButton: {
    backgroundColor: '#2e7d2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  activeVariant: {
    backgroundColor: '#ffd700',
  },
  variantText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeVariantText: {
    color: '#2e7d2e',
  },
  paytableButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  paytableButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  betAmountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  betLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
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
  },
  dealButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    padding: 20,
    alignItems: 'center',
  },
  gameInstruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  handContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    minWidth: 70,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heldCard: {
    backgroundColor: '#ffd700',
    borderWidth: 3,
    borderColor: '#ff6b6b',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heldText: {
    color: '#e74c3c',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  drawButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    paddingHorizontal: 40,
  },
  drawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    paddingHorizontal: 40,
  },
  newGameButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paytableContainer: {
    backgroundColor: '#1e7d32',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  paytableTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  paytableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  paytableHand: {
    color: '#fff',
    fontSize: 14,
  },
  paytablePayout: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
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

export default VideoPokerScreen;
