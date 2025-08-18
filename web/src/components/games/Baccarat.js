import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSocket } from '../../utils/socket';
import './Baccarat.css';

const Baccarat = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    phase: 'betting', // betting, dealing, reveal, ended
    playerCards: [],
    bankerCards: [],
    playerTotal: 0,
    bankerTotal: 0,
    winner: null,
    bets: {
      player: 0,
      banker: 0,
      tie: 0
    },
    gameHistory: []
  });
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(null);
  const [balance, setBalance] = useState(user?.balance || 0);

  useEffect(() => {
    if (!user) return;

    const newSocket = createSocket({
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Baccarat game');
      newSocket.emit('joinBaccarat');
    });

    newSocket.on('baccaratGameUpdate', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
    });

    newSocket.on('baccaratGameResult', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const placeBet = (betType) => {
    if (gameState.phase !== 'betting' || betAmount <= 0 || betAmount > balance) return;
    
    setSelectedBet(betType);
    if (socket) {
      socket.emit('placeBaccaratBet', {
        betType,
        amount: betAmount
      });
    }
  };

  const dealCards = () => {
    if (socket && gameState.phase === 'betting' && Object.values(gameState.bets).some(bet => bet > 0)) {
      socket.emit('dealBaccaratCards');
    }
  };

  const newGame = () => {
    if (socket) {
      socket.emit('newBaccaratGame');
    }
    setSelectedBet(null);
  };

  const getCardValue = (card) => {
    if (!card) return 0;
    const value = card.split(' ')[0];
    if (['J', 'Q', 'K'].includes(value)) return 0;
    if (value === 'A') return 1;
    return parseInt(value);
  };

  const calculateHandTotal = (cards) => {
    const total = cards.reduce((sum, card) => sum + getCardValue(card), 0);
    return total % 10;
  };

  const getCardSuit = (card) => {
    if (!card) return '♠';
    const suit = card.split(' ')[2];
    const suitMap = { 'spades': '♠', 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣' };
    return suitMap[suit] || '♠';
  };

  const getCardDisplay = (card) => {
    if (!card) return { value: '?', suit: '♠' };
    const parts = card.split(' ');
    return {
      value: parts[0],
      suit: getCardSuit(card)
    };
  };

  const getBetPayouts = () => {
    return {
      player: 'Pays 1:1',
      banker: 'Pays 1:1 (5% commission)',
      tie: 'Pays 8:1'
    };
  };

  if (!user) {
    return (
      <div className="baccarat-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to play Baccarat</p>
        </div>
      </div>
    );
  }

  const payouts = getBetPayouts();

  return (
    <div className="baccarat-container">
      <div className="baccarat-header">
        <h2>🎯 Baccarat</h2>
        <div className="game-info">
          <span className="balance">Balance: ${balance}</span>
          <span className="phase">Phase: {gameState.phase}</span>
        </div>
      </div>

      <div className="baccarat-game">
        {/* Game Table */}
        <div className="baccarat-table">
          {/* Banker Section */}
          <div className="hand-section banker-section">
            <h3>Banker</h3>
            <div className="cards">
              {gameState.bankerCards.map((card, index) => {
                const cardData = getCardDisplay(card);
                return (
                  <div key={index} className={`card ${cardData.suit === '♥' || cardData.suit === '♦' ? 'red' : 'black'}`}>
                    <div className="card-value">{cardData.value}</div>
                    <div className="card-suit">{cardData.suit}</div>
                  </div>
                );
              })}
              {gameState.phase === 'betting' && (
                <div className="card face-down">
                  <div className="card-back">🂠</div>
                </div>
              )}
            </div>
            <div className="hand-total">
              {gameState.phase !== 'betting' && (
                <span>Total: {gameState.bankerTotal}</span>
              )}
            </div>
          </div>

          {/* Center Area */}
          <div className="table-center">
            <div className="game-status">
              {gameState.phase === 'betting' && <span>Place your bets!</span>}
              {gameState.phase === 'dealing' && <span>Dealing cards...</span>}
              {gameState.phase === 'reveal' && <span>Revealing results...</span>}
              {gameState.phase === 'ended' && gameState.winner && (
                <div className="game-result">
                  <span className="winner">Winner: {gameState.winner.toUpperCase()}</span>
                  <button className="new-game-btn" onClick={newGame}>
                    New Game
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Player Section */}
          <div className="hand-section player-section">
            <h3>Player</h3>
            <div className="cards">
              {gameState.playerCards.map((card, index) => {
                const cardData = getCardDisplay(card);
                return (
                  <div key={index} className={`card ${cardData.suit === '♥' || cardData.suit === '♦' ? 'red' : 'black'}`}>
                    <div className="card-value">{cardData.value}</div>
                    <div className="card-suit">{cardData.suit}</div>
                  </div>
                );
              })}
              {gameState.phase === 'betting' && (
                <div className="card face-down">
                  <div className="card-back">🂠</div>
                </div>
              )}
            </div>
            <div className="hand-total">
              {gameState.phase !== 'betting' && (
                <span>Total: {gameState.playerTotal}</span>
              )}
            </div>
          </div>
        </div>

        {/* Betting Area */}
        <div className="betting-area">
          <div className="bet-controls">
            <div className="bet-amount-controls">
              <label>Bet Amount:</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={balance}
                disabled={gameState.phase !== 'betting'}
              />
            </div>
          </div>

          <div className="betting-options">
            <div 
              className={`bet-option player-bet ${selectedBet === 'player' ? 'selected' : ''}`}
              onClick={() => placeBet('player')}
            >
              <h4>Player</h4>
              <p>{payouts.player}</p>
              <div className="bet-amount">
                ${gameState.bets.player}
              </div>
            </div>

            <div 
              className={`bet-option tie-bet ${selectedBet === 'tie' ? 'selected' : ''}`}
              onClick={() => placeBet('tie')}
            >
              <h4>Tie</h4>
              <p>{payouts.tie}</p>
              <div className="bet-amount">
                ${gameState.bets.tie}
              </div>
            </div>

            <div 
              className={`bet-option banker-bet ${selectedBet === 'banker' ? 'selected' : ''}`}
              onClick={() => placeBet('banker')}
            >
              <h4>Banker</h4>
              <p>{payouts.banker}</p>
              <div className="bet-amount">
                ${gameState.bets.banker}
              </div>
            </div>
          </div>

          {gameState.phase === 'betting' && Object.values(gameState.bets).some(bet => bet > 0) && (
            <button className="deal-btn" onClick={dealCards}>
              Deal Cards
            </button>
          )}
        </div>

        {/* Game History */}
        {gameState.gameHistory.length > 0 && (
          <div className="game-history">
            <h4>Recent Results</h4>
            <div className="history-items">
              {gameState.gameHistory.slice(-10).map((result, index) => (
                <div key={index} className={`history-item ${result.winner}`}>
                  {result.winner === 'player' ? 'P' : result.winner === 'banker' ? 'B' : 'T'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Rules */}
      <div className="game-rules">
        <h4>How to Play Baccarat</h4>
        <ul>
          <li><strong>Objective:</strong> Bet on which hand (Player or Banker) will have a total closest to 9, or if they'll tie.</li>
          <li><strong>Card Values:</strong> A=1, 2-9=face value, 10/J/Q/K=0</li>
          <li><strong>Scoring:</strong> Only the last digit counts (e.g., 15 = 5)</li>
          <li><strong>Payouts:</strong> Player 1:1, Banker 1:1 (5% commission), Tie 8:1</li>
          <li><strong>Third Card:</strong> Drawn automatically based on traditional rules</li>
        </ul>
      </div>
    </div>
  );
};

export default Baccarat;
