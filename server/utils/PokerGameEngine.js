class PokerGameEngine {
  constructor(room) {
    this.room = room;
    this.deck = [];
    this.currentHand = 0;
    this.actionTimeout = 30000; // 30 seconds
    this.actionTimers = new Map();
  }

  // Initialize a new hand
  startNewHand() {
    this.currentHand++;
    this.initializeDeck();
    this.shuffleDeck();
    
    // Reset game state
    this.room.gameState.phase = 'pre-flop';
    this.room.gameState.pot = 0;
    this.room.gameState.communityCards = [];
    this.room.gameState.currentBet = this.room.stakes.bigBlind;
    this.room.gameState.playerCards = [];
    
    // Move dealer button
    this.moveDealer();
    
    // Post blinds
    this.postBlinds();
    
    // Deal hole cards
    this.dealHoleCards();
    
    // Set first action to left of big blind
    this.setNextPlayer();
    
    return this.getGameState();
  }

  initializeDeck() {
    this.deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({ suit, rank, value: this.getCardValue(rank) });
      }
    }
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealHoleCards() {
    const activePlayers = this.getActivePlayers();
    
    // Deal 2 cards to each active player
    for (let round = 0; round < 2; round++) {
      for (const player of activePlayers) {
        const card = this.deck.pop();
        let playerCards = this.room.gameState.playerCards.find(
          pc => pc.playerId.toString() === player.user.toString()
        );
        
        if (!playerCards) {
          playerCards = {
            playerId: player.user,
            cards: []
          };
          this.room.gameState.playerCards.push(playerCards);
        }
        
        playerCards.cards.push(card);
      }
    }
  }

  postBlinds() {
    const activePlayers = this.getActivePlayers();
    const dealerIndex = activePlayers.findIndex(p => p.seat === this.room.gameState.dealerPosition);
    
    // Small blind (next player after dealer)
    const smallBlindIndex = (dealerIndex + 1) % activePlayers.length;
    const smallBlindPlayer = activePlayers[smallBlindIndex];
    this.collectBet(smallBlindPlayer.user, this.room.stakes.smallBlind, 'small-blind');
    
    // Big blind (next player after small blind)
    const bigBlindIndex = (dealerIndex + 2) % activePlayers.length;
    const bigBlindPlayer = activePlayers[bigBlindIndex];
    this.collectBet(bigBlindPlayer.user, this.room.stakes.bigBlind, 'big-blind');
  }

  collectBet(playerId, amount, actionType = 'bet') {
    const player = this.room.currentPlayers.find(
      p => p.user.toString() === playerId.toString()
    );
    
    if (!player) {
      throw new Error('Player not found');
    }
    
    const actualAmount = Math.min(amount, player.chips);
    player.chips -= actualAmount;
    this.room.gameState.pot += actualAmount;
    
    // Record the action
    this.room.gameState.lastAction = {
      playerId: playerId,
      action: actionType,
      amount: actualAmount,
      timestamp: new Date()
    };
    
    return actualAmount;
  }

  processPlayerAction(playerId, action, amount = 0) {
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer || currentPlayer.user.toString() !== playerId.toString()) {
      throw new Error('Not your turn');
    }
    
    // Clear action timer
    if (this.actionTimers.has(playerId)) {
      clearTimeout(this.actionTimers.get(playerId));
      this.actionTimers.delete(playerId);
    }
    
    let actualAmount = 0;
    
    switch (action) {
      case 'fold':
        this.foldPlayer(playerId);
        break;
        
      case 'check':
        if (this.room.gameState.currentBet > 0) {
          throw new Error('Cannot check, there is a bet to call');
        }
        break;
        
      case 'call':
        actualAmount = this.collectBet(playerId, this.room.gameState.currentBet);
        break;
        
      case 'bet':
      case 'raise':
        if (amount < this.room.gameState.currentBet * 2) {
          throw new Error('Raise amount too small');
        }
        actualAmount = this.collectBet(playerId, amount);
        this.room.gameState.currentBet = amount;
        break;
        
      case 'all-in':
        const player = this.room.currentPlayers.find(
          p => p.user.toString() === playerId.toString()
        );
        actualAmount = this.collectBet(playerId, player.chips);
        if (actualAmount > this.room.gameState.currentBet) {
          this.room.gameState.currentBet = actualAmount;
        }
        break;
        
      default:
        throw new Error('Invalid action');
    }
    
    // Record the action
    this.room.gameState.lastAction = {
      playerId: playerId,
      action: action,
      amount: actualAmount,
      timestamp: new Date()
    };
    
    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.advanceToNextPhase();
    } else {
      this.setNextPlayer();
    }
    
    return this.getGameState();
  }

  foldPlayer(playerId) {
    // Mark player as folded (remove from active players for this hand)
    const playerCards = this.room.gameState.playerCards.find(
      pc => pc.playerId.toString() === playerId.toString()
    );
    
    if (playerCards) {
      playerCards.folded = true;
    }
  }

  isBettingRoundComplete() {
    const activePlayers = this.getActivePlayers().filter(p => !this.isPlayerFolded(p.user));
    
    if (activePlayers.length <= 1) {
      return true;
    }
    
    // Check if all players have acted and matched the current bet
    let playersActed = 0;
    let playersMatchedBet = 0;
    
    for (const player of activePlayers) {
      const hasActed = this.room.gameState.lastAction && 
                      this.room.gameState.lastAction.playerId.toString() === player.user.toString();
      
      if (hasActed) {
        playersActed++;
        
        // Check if player has matched current bet (or is all-in)
        if (player.chips === 0 || this.getPlayerBetInRound(player.user) >= this.room.gameState.currentBet) {
          playersMatchedBet++;
        }
      }
    }
    
    return playersActed === activePlayers.length && playersMatchedBet === activePlayers.length;
  }

  advanceToNextPhase() {
    switch (this.room.gameState.phase) {
      case 'pre-flop':
        this.room.gameState.phase = 'flop';
        this.dealCommunityCards(3);
        break;
        
      case 'flop':
        this.room.gameState.phase = 'turn';
        this.dealCommunityCards(1);
        break;
        
      case 'turn':
        this.room.gameState.phase = 'river';
        this.dealCommunityCards(1);
        break;
        
      case 'river':
        this.room.gameState.phase = 'showdown';
        this.determineWinner();
        return;
    }
    
    // Reset for new betting round
    this.room.gameState.currentBet = 0;
    this.setNextPlayer(true); // Start from dealer +1
  }

  dealCommunityCards(count) {
    for (let i = 0; i < count; i++) {
      const card = this.deck.pop();
      this.room.gameState.communityCards.push(card);
    }
  }

  determineWinner() {
    const activePlayers = this.getActivePlayers().filter(p => !this.isPlayerFolded(p.user));
    
    if (activePlayers.length === 1) {
      // Only one player left - they win
      const winner = activePlayers[0];
      this.awardPot(winner.user, this.room.gameState.pot);
      return;
    }
    
    // Evaluate hands and determine winner(s)
    const playerHands = activePlayers.map(player => ({
      playerId: player.user,
      hand: this.evaluateHand(player.user),
      player: player
    }));
    
    // Sort by hand strength (implement hand ranking logic)
    playerHands.sort((a, b) => this.compareHands(b.hand, a.hand));
    
    // Award pot to winner(s) (handle ties)
    const winners = [playerHands[0]];
    for (let i = 1; i < playerHands.length; i++) {
      if (this.compareHands(playerHands[i].hand, playerHands[0].hand) === 0) {
        winners.push(playerHands[i]);
      } else {
        break;
      }
    }
    
    const potShare = Math.floor(this.room.gameState.pot / winners.length);
    winners.forEach(winner => {
      this.awardPot(winner.playerId, potShare);
    });
  }

  awardPot(playerId, amount) {
    const player = this.room.currentPlayers.find(
      p => p.user.toString() === playerId.toString()
    );
    
    if (player) {
      player.chips += amount;
    }
  }

  evaluateHand(playerId) {
    const playerCards = this.room.gameState.playerCards.find(
      pc => pc.playerId.toString() === playerId.toString()
    );
    
    if (!playerCards) {
      return { rank: 0, description: 'No cards' };
    }
    
    const allCards = [...playerCards.cards, ...this.room.gameState.communityCards];
    
    // Implement hand evaluation logic
    // This is a simplified version - in production, use a proper poker hand evaluator
    return this.getBestHand(allCards);
  }

  getBestHand(cards) {
    // Simplified hand evaluation - implement full poker hand rankings
    const cardValues = cards.map(c => c.value).sort((a, b) => b - a);
    
    // Check for pairs, straights, flushes, etc.
    // Return hand rank and description
    
    return {
      rank: Math.max(...cardValues), // Simplified - just return highest card
      description: 'High Card',
      cards: cards.slice(0, 5)
    };
  }

  compareHands(hand1, hand2) {
    // Return 1 if hand1 wins, -1 if hand2 wins, 0 if tie
    return hand1.rank - hand2.rank;
  }

  getActivePlayers() {
    return this.room.currentPlayers.filter(p => p.status === 'active');
  }

  getCurrentPlayer() {
    const activePlayers = this.getActivePlayers();
    return activePlayers.find(p => p.seat === this.room.gameState.currentPlayerPosition);
  }

  setNextPlayer(fromDealer = false) {
    const activePlayers = this.getActivePlayers();
    
    if (fromDealer) {
      const dealerIndex = activePlayers.findIndex(p => p.seat === this.room.gameState.dealerPosition);
      const nextIndex = (dealerIndex + 1) % activePlayers.length;
      this.room.gameState.currentPlayerPosition = activePlayers[nextIndex].seat;
    } else {
      const currentIndex = activePlayers.findIndex(p => p.seat === this.room.gameState.currentPlayerPosition);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      this.room.gameState.currentPlayerPosition = activePlayers[nextIndex].seat;
    }
    
    // Set action timer
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      this.setActionTimer(currentPlayer.user);
    }
  }

  setActionTimer(playerId) {
    const timer = setTimeout(() => {
      // Auto-fold if player doesn't act in time
      try {
        this.processPlayerAction(playerId, 'fold');
      } catch (error) {
        console.error('Auto-fold error:', error);
      }
    }, this.actionTimeout);
    
    this.actionTimers.set(playerId, timer);
  }

  moveDealer() {
    const activePlayers = this.getActivePlayers();
    const currentDealerIndex = activePlayers.findIndex(
      p => p.seat === this.room.gameState.dealerPosition
    );
    
    const nextDealerIndex = (currentDealerIndex + 1) % activePlayers.length;
    this.room.gameState.dealerPosition = activePlayers[nextDealerIndex].seat;
  }

  isPlayerFolded(playerId) {
    const playerCards = this.room.gameState.playerCards.find(
      pc => pc.playerId.toString() === playerId.toString()
    );
    
    return playerCards ? playerCards.folded : false;
  }

  getPlayerBetInRound(playerId) {
    // In a real implementation, track bets per round
    // For now, simplified version
    return 0;
  }

  getCardValue(rank) {
    const values = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  }

  getGameState() {
    return {
      room: this.room,
      currentHand: this.currentHand,
      timeRemaining: this.getTimeRemaining()
    };
  }

  getTimeRemaining() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || !this.actionTimers.has(currentPlayer.user)) {
      return null;
    }
    
    // Calculate remaining time (simplified)
    return 30; // seconds
  }

  cleanup() {
    // Clear all timers
    for (const timer of this.actionTimers.values()) {
      clearTimeout(timer);
    }
    this.actionTimers.clear();
  }
}

module.exports = PokerGameEngine;
