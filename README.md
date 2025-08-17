# Greenwood Games

A comprehensive casino game platform with web and mobile interfaces featuring slot machines, table games, and card games.

## 🎮 Features

### Games Included
- **🎰 Slot Machines**: Classic slots with various themes and multipliers
- **🃏 Blackjack**: Traditional 21 card game with dealer AI
- **🎲 Roulette**: European-style roulette with number and color betting
- **🎮 Card Games**: Poker and other card game variations (coming soon)

### Platform Support
- **Web Application**: React-based responsive web interface
- **Mobile Application**: React Native app for iOS and Android
- **Real-time Gaming**: Socket.IO for live game interactions
- **User Authentication**: Secure login and registration system

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

## 🎯 Getting Started

### Web Application
1. Navigate to `http://localhost:3000`
2. Register a new account or login
3. Start with $1000 virtual balance
4. Choose your game and start playing!

### Mobile Application
1. Install Expo Go app on your device
2. Run `npm run mobile:dev`
3. Scan the QR code with Expo Go
4. Register/login and start gaming!

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
