import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './VideoPoker.css';

const VideoPoker = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    phase: 'betting', // betting, draw, evaluate
    hand: [],
    held: [false, false, false, false, false],
    bet: 0,
    credits: 0,
    lastWin: null,
    paytable: {}
  });
  const [betAmount, setBetAmount] = useState(1);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [gameVariant, setGameVariant] = useState('jacksorbetter');

  const gameVariants = {
    jacksorbetter: 'Jacks or Better',
    deucesWild: 'Deuces Wild',
    bonusPoker: 'Bonus Poker',
    doublebonus: 'Double Bonus Poker'
  };

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Video Poker game');
      newSocket.emit('joinVideoPoker', { variant: gameVariant });
    });

    newSocket.on('videoPokerGameUpdate', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
    });

    newSocket.on('videoPokerResult', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, gameVariant]);

  const placeBet = () => {
    if (gameState.phase !== 'betting' || betAmount <= 0 || betAmount > balance) return;
    
    if (socket) {
      socket.emit('placeVideoPokerBet', {
        amount: betAmount
      });
    }
  };

  const dealCards = () => {
    if (socket && gameState.phase === 'betting' && gameState.bet > 0) {
      socket.emit('dealVideoPokerCards');
    }
  };

  const toggleHold = (index) => {
    if (gameState.phase !== 'draw') return;
    
    if (socket) {
      socket.emit('toggleVideoPokerHold', { index });
    }
  };

  const drawCards = () => {
    if (socket && gameState.phase === 'draw') {
      socket.emit('drawVideoPokerCards');
    }
  };

  const newGame = () => {
    if (socket) {
      socket.emit('newVideoPokerGame');
    }
  };

  const changeVariant = (variant) => {
    if (gameState.phase === 'betting') {
      setGameVariant(variant);
    }
  };

  const getCardDisplay = (card) => {
    if (!card) return { value: '?', suit: '♠' };
    const parts = card.split(' ');
    const suitMap = { 'spades': '♠', 'hearts': '♥', 'diamonds': '♦', 'clubs': '♣' };
    return {
      value: parts[0],
      suit: suitMap[parts[2]] || '♠'
    };
  };

  const getPaytable = () => {
    const paytables = {
      jacksorbetter: {
        'Royal Flush': [250, 500, 750, 1000, 4000],
        'Straight Flush': [50, 100, 150, 200, 250],
        'Four of a Kind': [25, 50, 75, 100, 125],
        'Full House': [9, 18, 27, 36, 45],
        'Flush': [6, 12, 18, 24, 30],
        'Straight': [4, 8, 12, 16, 20],
        'Three of a Kind': [3, 6, 9, 12, 15],
        'Two Pair': [2, 4, 6, 8, 10],
        'Jacks or Better': [1, 2, 3, 4, 5]
      },
      deucesWild: {
        'Royal Flush (Natural)': [250, 500, 750, 1000, 4000],
        'Four Deuces': [200, 400, 600, 800, 1000],
        'Royal Flush (Wild)': [25, 50, 75, 100, 125],
        'Five of a Kind': [15, 30, 45, 60, 75],
        'Straight Flush': [9, 18, 27, 36, 45],
        'Four of a Kind': [5, 10, 15, 20, 25],
        'Full House': [3, 6, 9, 12, 15],
        'Flush': [2, 4, 6, 8, 10],
        'Straight': [2, 4, 6, 8, 10],
        'Three of a Kind': [1, 2, 3, 4, 5]
      }
    };
    return paytables[gameVariant] || paytables.jacksorbetter;
  };

  if (!user) {
    return (
      <div className="video-poker-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to play Video Poker</p>
        </div>
      </div>
    );
  }

  const paytable = getPaytable();

  return (
    <div className="video-poker-container">
      <div className="video-poker-header">
        <h2>🃏 Video Poker</h2>
        <div className="game-info">
          <span className="balance">Balance: ${balance}</span>
          <span className="credits">Credits: {gameState.credits}</span>
        </div>
      </div>

      <div className="video-poker-game">
        {/* Game Variant Selection */}
        <div className="variant-selection">
          <h4>Game Variant:</h4>
          <div className="variant-options">
            {Object.entries(gameVariants).map(([key, name]) => (
              <button
                key={key}
                className={`variant-btn ${gameVariant === key ? 'active' : ''}`}
                onClick={() => changeVariant(key)}
                disabled={gameState.phase !== 'betting'}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Display */}
        <div className="cards-area">
          <div className="hand-display">
            {Array.from({ length: 5 }).map((_, index) => {
              const card = gameState.hand[index];
              const cardData = getCardDisplay(card);
              const isHeld = gameState.held[index];
              
              return (
                <div key={index} className="card-container">
                  {gameState.phase === 'draw' && (
                    <div className={`hold-indicator ${isHeld ? 'held' : ''}`}>
                      {isHeld ? 'HELD' : 'HOLD?'}
                    </div>
                  )}
                  <div 
                    className={`card ${cardData.suit === '♥' || cardData.suit === '♦' ? 'red' : 'black'} ${isHeld ? 'held' : ''}`}
                    onClick={() => toggleHold(index)}
                  >
                    {card ? (
                      <>
                        <div className="card-value">{cardData.value}</div>
                        <div className="card-suit">{cardData.suit}</div>
                      </>
                    ) : (
                      <div className="card-back">🂠</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {gameState.lastWin && (
            <div className="win-display">
              <div className="win-hand">{gameState.lastWin.hand}</div>
              <div className="win-amount">Win: {gameState.lastWin.amount} Credits</div>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          {gameState.phase === 'betting' && (
            <div className="betting-controls">
              <div className="bet-amount-controls">
                <label>Bet (Credits):</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value))}
                />
                <span className="bet-display">{betAmount}</span>
              </div>
              <button className="bet-btn" onClick={placeBet}>
                Bet {betAmount} Credit{betAmount > 1 ? 's' : ''}
              </button>
              {gameState.bet > 0 && (
                <button className="deal-btn" onClick={dealCards}>
                  Deal Cards
                </button>
              )}
            </div>
          )}

          {gameState.phase === 'draw' && (
            <div className="draw-controls">
              <div className="instructions">
                Click cards to hold/unhold, then draw
              </div>
              <button className="draw-btn" onClick={drawCards}>
                Draw Cards
              </button>
            </div>
          )}

          {gameState.phase === 'evaluate' && (
            <div className="result-controls">
              <button className="new-game-btn" onClick={newGame}>
                New Game
              </button>
            </div>
          )}
        </div>

        {/* Paytable */}
        <div className="paytable">
          <h4>Paytable - {gameVariants[gameVariant]}</h4>
          <div className="paytable-grid">
            <div className="paytable-header">
              <div className="hand-name">Hand</div>
              {[1, 2, 3, 4, 5].map(bet => (
                <div key={bet} className={`bet-column ${betAmount === bet ? 'current-bet' : ''}`}>
                  {bet}
                </div>
              ))}
            </div>
            {Object.entries(paytable).map(([hand, payouts]) => (
              <div key={hand} className="paytable-row">
                <div className="hand-name">{hand}</div>
                {payouts.map((payout, index) => (
                  <div key={index} className={`payout ${betAmount === index + 1 ? 'current-bet' : ''}`}>
                    {payout}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Game Rules */}
        <div className="game-rules">
          <h4>How to Play Video Poker</h4>
          <div className="rules-content">
            <div className="rule-section">
              <h5>Basic Gameplay:</h5>
              <ul>
                <li>1. Select your bet amount (1-5 credits)</li>
                <li>2. Click "Deal Cards" to receive 5 cards</li>
                <li>3. Click cards to hold them</li>
                <li>4. Click "Draw Cards" to replace unheld cards</li>
                <li>5. Get paid according to the paytable</li>
              </ul>
            </div>
            <div className="rule-section">
              <h5>Strategy Tips:</h5>
              <ul>
                <li>Always bet maximum credits for best Royal Flush payout</li>
                <li>Hold any paying hand (pair of Jacks or better)</li>
                <li>Hold four cards to a straight or flush</li>
                <li>Hold three cards to a royal flush</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPoker;
