# Greenwood Games - Complete Casino Platform with River777 Collection

A comprehensive casino game platform featuring classic casino games, the exciting River777 games collection, and cross-platform support with real-time multiplayer features.

## 🎮 Game Collection

### 🏆 Classic Casino Games
- **🎰 Slot Machines**: Classic slots with various themes and multipliers
- **🃏 Blackjack**: Traditional 21 card game with dealer AI
- **🎲 Roulette**: European-style roulette with number and color betting

### 🐉 River777 Games Collection (NEW!)
- **🐠 Fish Hunter**: Interactive shooting game in live ocean environment
  - Multiple fish types with different point values (10-200 points)
  - Auto-fishing mode for automated gameplay (30 seconds)
  - Real-time ammunition system with reload mechanics
  - Progressive scoring and earnings conversion

- **🐉 Dragon Tiger**: Fast-paced card comparison game
  - Simple high-card wins mechanism
  - Dragon, Tiger, and Tie betting options
  - Quick rounds with instant results
  - High payout ratios (2:1 standard, 8:1 tie)

- **🎡 Wheel of Fortune**: Colorful spinning wheel with 12 prize segments
  - Multiple prize tiers from $50 to $500
  - Mega Spin option for 4x bet multiplier
  - Real-time wheel physics and animations
  - Progressive biggest win tracking

### Platform Features
- **Web Application**: React-based responsive web interface
- **Mobile Application**: React Native app for iOS and Android  
- **Real-time Gaming**: Socket.IO for live game interactions and multiplayer
- **User Authentication**: Secure login and registration system
- **Cross-game Integration**: Seamless navigation between all games

## 🏗️ Project Structure

```
greenwood-games/
├── server/                 # Node.js backend server
│   ├── routes/            # API routes (auth, games, user)
│   ├── index.js           # Main server file
│   └── package.json       # Server dependencies
├── web/                   # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (auth)
│   │   └── App.js         # Main app component
│   └── package.json       # Web dependencies
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   └── context/       # Mobile context
│   ├── App.js             # Main mobile app
│   └── package.json       # Mobile dependencies
└── package.json           # Root package.json with scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For mobile development: Expo CLI
- **Windows PowerShell** (for development on Windows)

### Installation

1. **Install all dependencies** (PowerShell syntax):

   ```powershell
   npm run install:all
   ```

2. **Start the development servers**:

   ```powershell
   # Start both server and web (concurrently)
   npm run dev
   
   # Or start individually:
   npm run server:dev    # Backend server on port 5000
   npm run web:dev       # Web app on port 3000
   npm run mobile:dev    # Mobile app with Expo
   ```

### Environment Setup

Create a `.env` file in the `server` directory (PowerShell):

```powershell
# Navigate to server directory and create .env file
cd server
New-Item -Path ".env" -ItemType File
```

Add the following content to `.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017/greenwood_games  # Optional: for database
```

### Game Access Routes

Navigate to the following URLs once the application is running:

**Classic Casino Games:**
- `/games/slots` - Slot machines with multipliers and themes
- `/games/blackjack` - 21 card game with dealer AI
- `/games/roulette` - European roulette with betting system

**River777 Collection:**
- `/games/fish-hunter` - Interactive fish shooting arcade game
- `/games/dragon-tiger` - Fast-paced card comparison game  
- `/games/wheel-fortune` - Prize wheel with multiple tiers

All games feature real-time Socket.IO integration for multiplayer experiences and live updates.

## 🎯 Getting Started

### Web Application
1. Navigate to `http://localhost:3000`
2. Register a new account or login  
3. Start with $1000 virtual balance
4. Choose from Classic Casino or River777 Collection
5. Start playing and earning rewards!

### Mobile Application  
1. Install Expo Go app on your device
2. Run `npm run mobile:dev`
3. Scan the QR code with Expo Go
4. Register/login and enjoy all games on mobile!

### River777 Games Quick Guide

**Fish Hunter:** 
- Click on fish to shoot and earn points
- Bigger fish = more points (10-200 range)
- Use Auto mode for 30-second automated fishing
- Points convert to casino balance

**Dragon Tiger:**
- Choose Dragon, Tiger, or Tie
- Higher card wins (Dragon vs Tiger)
- Payouts: 2:1 on Dragon/Tiger, 8:1 on Tie
- Fast rounds perfect for quick gaming

**Wheel of Fortune:**
- Spin for prizes from $50 to $500
- Use Mega Spin for 4x bet and better odds
- Track your biggest wins
- 12 different prize segments

## 🎮 Game Rules

### Slot Machine
- Bet between $1-$100 per spin
- Match 3 symbols to win
- Multipliers range from 2x to 100x
- Different symbols have different payouts

### Blackjack
- Get as close to 21 without going over
- Aces count as 1 or 11
- Face cards count as 10
- Beat the dealer to win

### Roulette
- Bet on numbers (0-36) or colors (red/black)
- Single number pays 35:1
- Color bets pay 1:1
- Minimum bet $1, maximum $1000

## 🛠️ Development

### Adding New Games
1. Create game logic in `server/routes/games.js`
2. Add game components in `web/src/components/games/`
3. Create mobile screens in `mobile/src/screens/`
4. Update navigation and routes

### Database Integration
The current implementation uses in-memory storage. To add database persistence:
1. Install MongoDB or your preferred database
2. Update user and game data models
3. Replace in-memory arrays with database queries

### Real-time Features
Socket.IO is configured for real-time game updates:
- Slot machine results
- Multi-player game rooms
- Live dealer interactions
- Chat functionality

## 📱 Mobile Development Notes

- Uses Expo for easier development and deployment
- Socket.IO client for real-time communication
- AsyncStorage for local data persistence
- React Navigation for screen management

For physical device testing, update the server URL in `mobile/src/context/AuthContext.js` to your computer's IP address.

## 🔐 Security Notes

⚠️ **Important**: This is a demonstration project with mock authentication and in-memory storage. For production use:

- Implement proper user authentication with password hashing
- Add input validation and sanitization
- Use environment variables for sensitive data
- Implement rate limiting and anti-fraud measures
- Add SSL/TLS encryption
- Use a production database with proper backup

## 📝 TODO / Future Enhancements

- [ ] Complete mobile Blackjack and Roulette implementations
- [ ] Add Texas Hold'em Poker
- [ ] Implement video poker variations
- [ ] Add progressive jackpots
- [ ] Create admin dashboard
- [ ] Add game statistics and analytics
- [ ] Implement tournaments and leaderboards
- [ ] Add social features (friends, chat)
- [ ] Payment processing integration
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

Greenwood Games is for entertainment and educational purposes only. Please gamble responsibly and in accordance with your local laws and regulations.
#   G i t H u b   A c t i o n s   D e p l o y m e n t   T e s t   -   0 9 / 1 5 / 2 0 2 5   0 4 : 0 8 : 2 0  
 