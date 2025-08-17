# 🎰 Greenwood Games - Live Deployment Guide

## 🚀 Complete Casino Platform - 8 Development Phases

A full-stack casino gaming platform with advanced features including cryptocurrency integration, AI-powered gaming, tournaments, and progressive jackpots.

### ✨ **Platform Features:**
- **10+ Casino Games**: Slots, Blackjack, Roulette, Baccarat, Craps, Video Poker, Live Poker
- **Cross-Platform**: Web application + React Native mobile app
- **Advanced Features**: Cryptocurrency support, AI gaming assistant, tournaments, progressive jackpots
- **Enterprise Security**: JWT authentication, rate limiting, input validation
- **Production Ready**: Docker deployment, monitoring, SSL support

---

## 🎯 **Development Phases Complete:**

### ✅ **Phase 1**: Sound & Visual Effects
- Enhanced slot machine themes and animations
- Progressive jackpot visual indicators
- Texas Hold'em poker implementation

### ✅ **Phase 2**: Database Integration
- MongoDB integration with user/transaction/session models
- Data persistence and user management

### ✅ **Phase 3**: Multiplayer Features
- Live poker rooms and tournaments
- Real-time chat system
- Socket.IO multiplayer integration

### ✅ **Phase 4**: New Games
- Baccarat with full gameplay mechanics
- Craps with comprehensive betting system
- Video Poker variants

### ✅ **Phase 5**: Mobile Enhancement
- React Native app with multiplayer optimization
- All Phase 4 games mobile-optimized

### ✅ **Phase 6**: Advanced Features
- Live dealer integration
- Social features and user profiles
- Analytics dashboard

### ✅ **Phase 7**: Production Ready
- Security hardening and HTTPS
- Docker deployment infrastructure
- Monitoring with Prometheus/Grafana

### ✅ **Phase 8**: Advanced Gaming Features ⭐ NEW!
- **Cryptocurrency Integration**: Bitcoin, Ethereum, USDT, USDC support
- **AI Gaming Assistant**: Smart recommendations and fraud detection
- **Advanced Tournaments**: Multiple bracket formats
- **Progressive Jackpots**: Multi-tier cross-game jackpot system

---

## 🛠️ **Quick Deployment:**

### **Prerequisites:**
- Node.js 18+ 
- MongoDB (local or Atlas)
- Docker (for production deployment)

### **1. Clone & Install:**
\`\`\`bash
git clone https://github.com/yourusername/greenwood-games.git
cd greenwood-games
npm install
cd server && npm install
cd ../web && npm install
cd ../mobile && npm install
\`\`\`

### **2. Environment Setup:**
Create `.env` in root directory:
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/greenwood_games
DB_NAME=greenwood_games

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# Server
PORT=5000
NODE_ENV=development

# Phase 8 Features
COINGECKO_API_URL=https://api.coingecko.com/api/v3
AI_GAMING_ENABLED=true
TOURNAMENTS_ENABLED=true
PROGRESSIVE_JACKPOTS_ENABLED=true

# External APIs (Optional)
EXTERNAL_API_KEY=your-api-key
\`\`\`

### **3. Development Mode:**
\`\`\`bash
# Start all services
npm run dev

# Or start individually:
npm run server:dev  # Server on port 5000
npm run web:dev     # Web on port 3000
npm run mobile:dev  # Mobile with Expo
\`\`\`

### **4. Production Deployment:**
\`\`\`bash
# Docker deployment
cp .env.production .env
npm run deploy:start

# Manual deployment
npm run build
npm run start:prod
\`\`\`

---

## 📱 **Access Points:**

### **Development:**
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:5000
- **Mobile**: Expo Go app with QR code

### **Production:**
- **Main Site**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Monitoring**: https://yourdomain.com:3001

---

## 🎮 **Available Games:**

| Game Type | Games Available | Features |
|-----------|----------------|----------|
| **Slots** | 8 themes | Progressive jackpots, bonus rounds |
| **Table Games** | Blackjack, Roulette, Baccarat, Craps | Live dealer options |
| **Poker** | Texas Hold'em, Video Poker | Tournaments, multiplayer |
| **Specialty** | Various mini-games | Social features |

---

## 💰 **Phase 8 Advanced Features:**

### **🪙 Cryptocurrency Integration:**
- Support for Bitcoin, Ethereum, USDT, USDC
- Real-time price tracking via CoinGecko API
- Secure wallet generation and management
- Transaction processing and validation

### **🤖 AI Gaming Assistant:**
- Intelligent game recommendations
- Fraud detection and prevention
- User behavior analysis
- Personalized gaming insights

### **🏆 Tournament System:**
- Multiple bracket formats (Elimination, Double Elimination, Round Robin, Swiss)
- Real-time leaderboards
- Prize distribution system
- Tournament history tracking

### **🎰 Progressive Jackpots:**
- Multi-tier jackpot system (Mini, Minor, Major, Mega)
- Cross-game contributions
- Real-time jackpot tracking
- Win probability algorithms

---

## 🔧 **API Endpoints:**

### **Core APIs:**
- \`GET /api/games\` - Available games
- \`POST /api/auth/login\` - User authentication
- \`GET /api/user/profile\` - User profile

### **Phase 8 APIs:**
- \`GET /api/phase8/overview\` - Phase 8 feature overview
- \`GET /api/phase8/crypto/prices\` - Cryptocurrency prices
- \`GET /api/phase8/jackpots\` - Progressive jackpots
- \`GET /api/phase8/tournaments\` - Active tournaments
- \`POST /api/phase8/ai/recommend\` - AI recommendations

---

## 📊 **Monitoring & Analytics:**

### **Health Checks:**
\`\`\`bash
# Check server health
curl http://localhost:5000/health

# View metrics
curl http://localhost:5000/metrics
\`\`\`

### **Monitoring Stack:**
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Custom Analytics**: User behavior tracking

---

## 🛡️ **Security Features:**

- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: API protection
- **Input Validation**: Data sanitization
- **HTTPS Enforcement**: SSL/TLS encryption
- **Helmet.js**: Security headers
- **CORS Protection**: Cross-origin security

---

## 📋 **Testing:**

\`\`\`bash
# Run tests
npm test

# Test specific components
npm run test:server
npm run test:web
npm run test:mobile
\`\`\`

---

## 🐳 **Docker Deployment:**

\`\`\`bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
\`\`\`

---

## 📞 **Support:**

- **Documentation**: Full API documentation available
- **Issues**: GitHub Issues for bug reports
- **Features**: Feature requests welcome

---

## 📄 **License:**

MIT License - See LICENSE file for details.

---

## 🏆 **Achievement Unlocked:**

**Complete Casino Platform**: 8 development phases, 50+ features, enterprise-grade security, cross-platform support, and cutting-edge gaming technology including cryptocurrency integration and AI-powered assistance! 🎰🚀

**Ready for Live Deployment!** ✨
