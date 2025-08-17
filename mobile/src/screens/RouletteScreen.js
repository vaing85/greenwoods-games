import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

const RouletteScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎲 Roulette</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          The mobile version of Roulette is currently under development.
          For now, please use the web version for the full gaming experience.
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => Alert.alert(
            'Roulette Rules',
            '• Place bets on numbers, colors, or groups\n• Numbers 1-36 plus 0 (green)\n• Red/Black pays 1:1\n• Single numbers pay 35:1\n• Spin the wheel and win!',
            [{ text: 'OK' }]
          )}
        >
          <Text style={styles.infoButtonText}>Game Rules</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 48,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  infoButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
});

export default RouletteScreen;
