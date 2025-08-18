import React, { useState } from 'react';
import './DragonTiger.css';

const DragonTiger = ({ socket }) => {
  const [balance, setBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState(null);
  const [dragonCard, setDragonCard] = useState('?');
  const [tigerCard, setTigerCard] = useState('?');
  const [dragonWins, setDragonWins] = useState(0);
  const [tigerWins, setTigerWins] = useState(0);
  const [ties, setTies] = useState(0);
  const [gameMessage, setGameMessage] = useState('Place your bet!');
  const [isDealing, setIsDealing] = useState(false);

  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠️', '♥️', '♦️', '♣️'];

  const getCardValue = (card) => {
    if (card === 'A') return 1;
    if (['J', 'Q', 'K'].includes(card)) return 10;
    return parseInt(card) || 10;
  };

  const placeBet = (betType) => {
    if (balance < 200) {
      setGameMessage('Insufficient balance!');
      return;
    }

    if (isDealing) {
      setGameMessage('Wait for current game to finish!');
      return;
    }

    setCurrentBet(betType);
    setGameMessage(`Bet placed on ${betType.toUpperCase()}! Click Deal to start.`);
  };

  const dealCards = () => {
    if (!currentBet) {
      setGameMessage('Place a bet first!');
      return;
    }

    if (isDealing) return;

    setBalance(prev => prev - 200);
    setIsDealing(true);
    setGameMessage('Dealing cards...');

    // Animate dealing
    setTimeout(() => {
      const dragonCardValue = cards[Math.floor(Math.random() * cards.length)];
      const tigerCardValue = cards[Math.floor(Math.random() * cards.length)];
      const dragonSuit = suits[Math.floor(Math.random() * suits.length)];
      const tigerSuit = suits[Math.floor(Math.random() * suits.length)];

      setDragonCard(dragonCardValue + dragonSuit);
      setTigerCard(tigerCardValue + tigerSuit);

      // Determine winner
      const dragonValue = getCardValue(dragonCardValue);
      const tigerValue = getCardValue(tigerCardValue);

      let winner = '';
      if (dragonValue > tigerValue) {
        winner = 'dragon';
        setDragonWins(prev => prev + 1);
      } else if (tigerValue > dragonValue) {
        winner = 'tiger';
        setTigerWins(prev => prev + 1);
      } else {
        winner = 'tie';
        setTies(prev => prev + 1);
      }

      // Check win
      if (currentBet === winner) {
        const winAmount = currentBet === 'tie' ? 800 : 400;
        setBalance(prev => prev + winAmount);
        setGameMessage(`🎉 ${winner.toUpperCase()} WINS! You won $${winAmount}!`);
        
        // Emit to server
        if (socket) {
          socket.emit('dragonTigerWin', { bet: currentBet, winAmount, winner });
        }
      } else {
        setGameMessage(`${winner.toUpperCase()} wins! Better luck next time!`);
      }

      // Reset for next game
      setTimeout(() => {
        setDragonCard('?');
        setTigerCard('?');
        setCurrentBet(null);
        setIsDealing(false);
        setGameMessage('Place your bet for the next round!');
      }, 3000);

    }, 2000);
  };

  return (
    <div className="dragon-tiger-container">
      <div className="game-header">
        <h2>🐉 Dragon Tiger</h2>
        <div className="balance-display">
          Balance: ${balance.toLocaleString()}
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <div className="stat-value">{dragonWins}</div>
          <div className="stat-label">Dragon Wins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{tigerWins}</div>
          <div className="stat-label">Tiger Wins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{ties}</div>
          <div className="stat-label">Ties</div>
        </div>
      </div>

      <div className="dragon-tiger-table">
        <div 
          className={`card-zone dragon-zone ${currentBet === 'dragon' ? 'selected' : ''}`}
          onClick={() => placeBet('dragon')}
        >
          <h3>🐉 DRAGON</h3>
          <div className={`card-display ${dragonCard.includes('♥️') || dragonCard.includes('♦️') ? 'red' : ''}`}>
            {dragonCard}
          </div>
          <p>Click to Bet $200</p>
          <div className="payout">Pays 2:1</div>
        </div>

        <div className="vs-divider">
          <div className="vs-text">VS</div>
          <button 
            className="deal-btn"
            onClick={dealCards}
            disabled={!currentBet || isDealing}
          >
            {isDealing ? 'Dealing...' : 'DEAL'}
          </button>
        </div>

        <div 
          className={`card-zone tiger-zone ${currentBet === 'tiger' ? 'selected' : ''}`}
          onClick={() => placeBet('tiger')}
        >
          <h3>🐅 TIGER</h3>
          <div className={`card-display ${tigerCard.includes('♥️') || tigerCard.includes('♦️') ? 'red' : ''}`}>
            {tigerCard}
          </div>
          <p>Click to Bet $200</p>
          <div className="payout">Pays 2:1</div>
        </div>
      </div>

      <div className="tie-bet-section">
        <button 
          className={`tie-bet-btn ${currentBet === 'tie' ? 'selected' : ''}`}
          onClick={() => placeBet('tie')}
          disabled={isDealing}
        >
          🤝 BET TIE - $200 (Pays 8:1)
        </button>
      </div>

      <div className="game-message">
        {gameMessage}
      </div>

      <div className="game-rules">
        <h4>How to Play:</h4>
        <ul>
          <li>Dragon and Tiger each get one card</li>
          <li>Highest card wins (A=1, J/Q/K=10)</li>
          <li>Dragon/Tiger bets pay 2:1</li>
          <li>Tie bets pay 8:1</li>
        </ul>
      </div>
    </div>
  );
};

export default DragonTiger;
