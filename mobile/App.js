import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SlotMachineScreen from './src/screens/SlotMachineScreen';
import BlackjackScreen from './src/screens/BlackjackScreen';
import RouletteScreen from './src/screens/RouletteScreen';
import BaccaratScreen from './src/screens/BaccaratScreen';
import CrapsScreen from './src/screens/CrapsScreen';
import VideoPokerScreen from './src/screens/VideoPokerScreen';
import LivePokerScreen from './src/screens/LivePokerScreen';
import LiveDealerScreen from './src/screens/LiveDealerScreen';
import SocialHubScreen from './src/screens/SocialHubScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
// Phase 8 Advanced Features
import CryptoWalletScreen from './src/screens/CryptoWalletScreen';
import AIGamingScreen from './src/screens/AIGamingScreen';
import TournamentScreen from './src/screens/TournamentScreen';
import ProgressiveJackpotScreen from './src/screens/ProgressiveJackpotScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1a1a1a" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: '🎰 Greenwood Games',
              headerLeft: null 
            }}
          />
          <Stack.Screen 
            name="SlotMachine" 
            component={SlotMachineScreen}
            options={{ title: '🎰 Slot Machine' }}
          />
          <Stack.Screen 
            name="Blackjack" 
            component={BlackjackScreen}
            options={{ title: '🃏 Blackjack' }}
          />
          <Stack.Screen 
            name="Roulette" 
            component={RouletteScreen}
            options={{ title: '🎲 Roulette' }}
          />
          <Stack.Screen 
            name="Baccarat" 
            component={BaccaratScreen}
            options={{ title: '🎴 Baccarat' }}
          />
          <Stack.Screen 
            name="Craps" 
            component={CrapsScreen}
            options={{ title: '🎲 Craps' }}
          />
          <Stack.Screen 
            name="VideoPoker" 
            component={VideoPokerScreen}
            options={{ title: '🃖 Video Poker' }}
          />
          <Stack.Screen 
            name="LivePoker" 
            component={LivePokerScreen}
            options={{ title: '♠️ Live Poker' }}
          />
          <Stack.Screen 
            name="LiveDealer" 
            component={LiveDealerScreen}
            options={{ title: '🎭 Live Dealer' }}
          />
          <Stack.Screen 
            name="SocialHub" 
            component={SocialHubScreen}
            options={{ title: '👥 Social Hub' }}
          />
          <Stack.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{ title: '📊 Analytics' }}
          />
          <Stack.Screen 
            name="CryptoWallet" 
            component={CryptoWalletScreen}
            options={{ title: '₿ Crypto Wallet', headerShown: false }}
          />
          <Stack.Screen 
            name="AIGaming" 
            component={AIGamingScreen}
            options={{ title: '🤖 AI Assistant', headerShown: false }}
          />
          <Stack.Screen 
            name="Tournament" 
            component={TournamentScreen}
            options={{ title: '🏆 Tournaments', headerShown: false }}
          />
          <Stack.Screen 
            name="ProgressiveJackpot" 
            component={ProgressiveJackpotScreen}
            options={{ title: '💰 Jackpots', headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
