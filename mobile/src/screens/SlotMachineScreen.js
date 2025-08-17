import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const SlotMachineScreen = ({ route }) => {
  const { user, updateBalance } = useAuth();
  const { gameId } = route.params || {};
  
  const [socket, setSocket] = useState(null);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastResult, setLastResult] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
  const minBet = 1;
  const maxBet = 100;

  // Animation values for spinning reels
  const spinAnimations = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ];

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('slot-result', (result) => {
      setReels(result.reels);
      setLastResult(result);
      setSpinning(false);
      
      // Stop animations
      spinAnimations.forEach(anim => anim.stopAnimation());
      
      if (result.isWin) {
        const winAmount = bet * result.multiplier;
        updateBalance(user.balance + winAmount);
        Alert.alert('🎉 Winner!', `You won $${winAmount}!`);
      } else {
        updateBalance(user.balance - bet);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const startSpinAnimation = () => {
    spinAnimations.forEach(anim => {
      anim.setValue(0);
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ).start();
    });
  };

  const handleSpin = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    if (user.balance < bet) {
      Alert.alert('Error', 'Insufficient balance!');
      return;
    }

    setSpinning(true);
    setLastResult(null);
    
    // Start spinning animation
    startSpinAnimation();
    
    // Show random symbols while spinning
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 100);

    // Send spin request to server
    socket.emit('spin-slot', { bet, userId: user.id });

    // Clear interval after animation
    setTimeout(() => {
      clearInterval(spinInterval);
    }, 2000);
  };

  const adjustBet = (amount) => {
    const newBet = bet + amount;
    if (newBet >= minBet && newBet <= maxBet && newBet <= user.balance) {
      setBet(newBet);
    }
  };

  const getSpinTransform = (animValue) => ({
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balanceText}>Balance: ${user?.balance}</Text>
        <View style={[
          styles.connectionStatus,
          { backgroundColor: isConnected ? '#4CAF50' : '#ff6b6b' }
        ]}>
          <Text style={styles.connectionText}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.slotMachine}>
        <View style={styles.reelsContainer}>
          {reels.map((symbol, index) => (
            <Animated.View
              key={index}
              style={[
                styles.reel,
                spinning && getSpinTransform(spinAnimations[index])
              ]}
            >
              <Text style={styles.symbol}>{symbol}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.betControls}>
          <TouchableOpacity
            style={[styles.betButton, (spinning || bet <= minBet) && styles.buttonDisabled]}
            onPress={() => adjustBet(-5)}
            disabled={spinning || bet <= minBet}
          >
            <Text style={styles.betButtonText}>-$5</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.betButton, (spinning || bet <= minBet) && styles.buttonDisabled]}
            onPress={() => adjustBet(-1)}
            disabled={spinning || bet <= minBet}
          >
            <Text style={styles.betButtonText}>-$1</Text>
          </TouchableOpacity>

          <View style={styles.betDisplay}>
            <Text style={styles.betText}>Bet: ${bet}</Text>
          </View>

          <TouchableOpacity
            style={[styles.betButton, (spinning || bet >= maxBet || bet >= user.balance) && styles.buttonDisabled]}
            onPress={() => adjustBet(1)}
            disabled={spinning || bet >= maxBet || bet >= user.balance}
          >
            <Text style={styles.betButtonText}>+$1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.betButton, (spinning || bet >= maxBet || bet + 5 > user.balance) && styles.buttonDisabled]}
            onPress={() => adjustBet(5)}
            disabled={spinning || bet >= maxBet || bet + 5 > user.balance}
          >
            <Text style={styles.betButtonText}>+$5</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.spinButton, (spinning || !isConnected || user.balance < bet) && styles.buttonDisabled]}
          onPress={handleSpin}
          disabled={spinning || !isConnected || user.balance < bet}
        >
          <Text style={styles.spinButtonText}>
            {spinning ? 'SPINNING...' : 'SPIN'}
          </Text>
        </TouchableOpacity>

        {lastResult && (
          <View style={[
            styles.resultContainer,
            { backgroundColor: lastResult.isWin ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)' }
          ]}>
            <Text style={styles.resultText}>
              {lastResult.isWin
                ? `🎉 WIN! ${lastResult.multiplier}x - You won $${bet * lastResult.multiplier}!`
                : '😔 No win this time. Better luck next spin!'
              }
            </Text>
          </View>
        )}
      </View>

      <View style={styles.payTable}>
        <Text style={styles.payTableTitle}>Pay Table</Text>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>🍒🍒🍒</Text>
          <Text style={styles.payTableMultiplier}>2x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>🍋🍋🍋</Text>
          <Text style={styles.payTableMultiplier}>3x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>🍊🍊🍊</Text>
          <Text style={styles.payTableMultiplier}>4x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>🍇🍇🍇</Text>
          <Text style={styles.payTableMultiplier}>5x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>🔔🔔🔔</Text>
          <Text style={styles.payTableMultiplier}>10x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>💎💎💎</Text>
          <Text style={styles.payTableMultiplier}>25x</Text>
        </View>
        <View style={styles.payTableRow}>
          <Text style={styles.payTableSymbol}>7️⃣7️⃣7️⃣</Text>
          <Text style={styles.payTableMultiplier}>100x</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
  },
  slotMachine: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
  },
  reel: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#333',
  },
  symbol: {
    fontSize: 40,
  },
  betControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  betButton: {
    backgroundColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#666',
  },
  betButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  betDisplay: {
    marginHorizontal: 15,
  },
  betText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spinButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  payTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
  },
  payTableTitle: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  payTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  payTableSymbol: {
    color: '#fff',
    fontSize: 14,
  },
  payTableMultiplier: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SlotMachineScreen;
