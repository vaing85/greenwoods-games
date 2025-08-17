import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

const BlackjackScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🃏 Blackjack</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          The mobile version of Blackjack is currently under development.
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
            'Blackjack Rules',
            '• Get as close to 21 as possible without going over\n• Aces count as 1 or 11\n• Face cards count as 10\n• Beat the dealer to win!',
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

export default BlackjackScreen;
