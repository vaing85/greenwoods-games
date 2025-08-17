import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './Craps.css';

const Craps = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    phase: 'comeout', // comeout, point
    point: null,
    lastRoll: [],
    rollHistory: [],
    bets: {},
    totalBet: 0
  });
  const [betAmount, setBetAmount] = useState(5);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Craps game');
      newSocket.emit('joinCraps');
    });

    newSocket.on('crapsGameUpdate', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
      setRolling(false);
    });

    newSocket.on('crapsRollResult', (data) => {
      setGameState(data.gameState);
      setBalance(data.balance);
      setRolling(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const placeBet = (betType) => {
    if (betAmount <= 0 || betAmount > balance || rolling) return;
    
    if (socket) {
      socket.emit('placeCrapsBet', {
        betType,
        amount: betAmount
      });
    }
  };

  const rollDice = () => {
    if (socket && !rolling && gameState.totalBet > 0) {
      setRolling(true);
      socket.emit('rollDice');
    }
  };

  const clearBets = () => {
    if (socket && !rolling) {
      socket.emit('clearCrapsBets');
    }
  };

  const getDiceDisplay = (die) => {
    const dots = {
      1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅'
    };
    return dots[die] || '⚀';
  };

  const getBetDescription = (betType) => {
    const descriptions = {
      pass: 'Pass Line - Win on 7,11 (comeout) or point. Lose on 2,3,12 (comeout) or 7 (point)',
      dontpass: "Don't Pass - Opposite of Pass Line",
      field: 'Field - Win on 2,3,4,9,10,11,12. Pays 2:1 on 2,12',
      any7: 'Any 7 - Win if next roll is 7. Pays 4:1',
      anycraps: 'Any Craps - Win on 2,3,12. Pays 7:1',
      yo: 'Yo (11) - Win if next roll is 11. Pays 15:1',
      ace: 'Aces (2) - Win if next roll is 2. Pays 30:1',
      boxcars: 'Boxcars (12) - Win if next roll is 12. Pays 30:1'
    };
    return descriptions[betType] || '';
  };

  const getBetPayout = (betType) => {
    const payouts = {
      pass: '1:1',
      dontpass: '1:1',
      field: '1:1 (2:1 on 2,12)',
      any7: '4:1',
      anycraps: '7:1',
      yo: '15:1',
      ace: '30:1',
      boxcars: '30:1'
    };
    return payouts[betType] || '1:1';
  };

  if (!user) {
    return (
      <div className="craps-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to play Craps</p>
        </div>
      </div>
    );
  }

  const rollTotal = gameState.lastRoll.length > 0 ? 
    gameState.lastRoll.reduce((sum, die) => sum + die, 0) : 0;

  return (
    <div className="craps-container">
      <div className="craps-header">
        <h2>🎲 Craps</h2>
        <div className="game-info">
          <span className="balance">Balance: ${balance}</span>
          <span className="phase">
            {gameState.phase === 'comeout' ? 'Come Out Roll' : `Point: ${gameState.point}`}
          </span>
        </div>
      </div>

      <div className="craps-game">
        {/* Dice Area */}
        <div className="dice-area">
          <div className="dice-display">
            {gameState.lastRoll.length > 0 ? (
              <div className="dice-container">
                {gameState.lastRoll.map((die, index) => (
                  <div key={index} className={`die ${rolling ? 'rolling' : ''}`}>
                    {getDiceDisplay(die)}
                  </div>
                ))}
                <div className="roll-total">
                  Total: {rollTotal}
                </div>
              </div>
            ) : (
              <div className="no-roll">
                <div className="die">⚀</div>
                <div className="die">⚀</div>
                <div className="ready-text">Ready to Roll</div>
              </div>
            )}
          </div>

          <div className="roll-controls">
            <button 
              className="roll-btn"
              onClick={rollDice}
              disabled={rolling || gameState.totalBet === 0}
            >
              {rolling ? 'Rolling...' : 'Roll Dice'}
            </button>
            <button 
              className="clear-btn"
              onClick={clearBets}
              disabled={rolling}
            >
              Clear Bets
            </button>
          </div>
        </div>

        {/* Betting Controls */}
        <div className="bet-controls">
          <div className="bet-amount-controls">
            <label>Bet Amount:</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={balance}
              disabled={rolling}
            />
          </div>
          <div className="total-bet">
            Total Bet: ${gameState.totalBet}
          </div>
        </div>

        {/* Betting Table */}
        <div className="betting-table">
          {/* Main Bets */}
          <div className="main-bets">
            <div className="bet-section">
              <h4>Line Bets</h4>
              <div className="bet-options">
                <div 
                  className="bet-option pass-line"
                  onClick={() => placeBet('pass')}
                >
                  <div className="bet-name">Pass Line</div>
                  <div className="bet-payout">{getBetPayout('pass')}</div>
                  <div className="bet-amount">${gameState.bets.pass || 0}</div>
                </div>
                <div 
                  className="bet-option dont-pass"
                  onClick={() => placeBet('dontpass')}
                >
                  <div className="bet-name">Don't Pass</div>
                  <div className="bet-payout">{getBetPayout('dontpass')}</div>
                  <div className="bet-amount">${gameState.bets.dontpass || 0}</div>
                </div>
              </div>
            </div>

            <div className="bet-section">
              <h4>Field Bet</h4>
              <div className="bet-options">
                <div 
                  className="bet-option field-bet"
                  onClick={() => placeBet('field')}
                >
                  <div className="bet-name">Field</div>
                  <div className="bet-numbers">2 3 4 9 10 11 12</div>
                  <div className="bet-payout">{getBetPayout('field')}</div>
                  <div className="bet-amount">${gameState.bets.field || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Proposition Bets */}
          <div className="prop-bets">
            <h4>Proposition Bets</h4>
            <div className="prop-grid">
              <div 
                className="bet-option prop-bet"
                onClick={() => placeBet('any7')}
              >
                <div className="bet-name">Any 7</div>
                <div className="bet-payout">{getBetPayout('any7')}</div>
                <div className="bet-amount">${gameState.bets.any7 || 0}</div>
              </div>
              <div 
                className="bet-option prop-bet"
                onClick={() => placeBet('anycraps')}
              >
                <div className="bet-name">Any Craps</div>
                <div className="bet-payout">{getBetPayout('anycraps')}</div>
                <div className="bet-amount">${gameState.bets.anycraps || 0}</div>
              </div>
              <div 
                className="bet-option prop-bet"
                onClick={() => placeBet('yo')}
              >
                <div className="bet-name">Yo (11)</div>
                <div className="bet-payout">{getBetPayout('yo')}</div>
                <div className="bet-amount">${gameState.bets.yo || 0}</div>
              </div>
              <div 
                className="bet-option prop-bet"
                onClick={() => placeBet('ace')}
              >
                <div className="bet-name">Aces (2)</div>
                <div className="bet-payout">{getBetPayout('ace')}</div>
                <div className="bet-amount">${gameState.bets.ace || 0}</div>
              </div>
              <div 
                className="bet-option prop-bet"
                onClick={() => placeBet('boxcars')}
              >
                <div className="bet-name">Boxcars (12)</div>
                <div className="bet-payout">{getBetPayout('boxcars')}</div>
                <div className="bet-amount">${gameState.bets.boxcars || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Roll History */}
        {gameState.rollHistory.length > 0 && (
          <div className="roll-history">
            <h4>Roll History</h4>
            <div className="history-rolls">
              {gameState.rollHistory.slice(-10).map((roll, index) => (
                <div key={index} className="history-roll">
                  <div className="roll-dice">
                    {roll.dice.map((die, dieIndex) => (
                      <span key={dieIndex} className="mini-die">
                        {getDiceDisplay(die)}
                      </span>
                    ))}
                  </div>
                  <div className="roll-total">{roll.total}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Rules */}
        <div className="game-rules">
          <h4>How to Play Craps</h4>
          <div className="rules-content">
            <div className="rule-section">
              <h5>Come Out Roll:</h5>
              <ul>
                <li>Pass Line wins on 7 or 11, loses on 2, 3, or 12</li>
                <li>Any other number becomes the "point"</li>
              </ul>
            </div>
            <div className="rule-section">
              <h5>Point Round:</h5>
              <ul>
                <li>Pass Line wins if point is rolled again</li>
                <li>Pass Line loses if 7 is rolled</li>
              </ul>
            </div>
            <div className="rule-section">
              <h5>Other Bets:</h5>
              <ul>
                <li>Field: One-roll bet on 2,3,4,9,10,11,12</li>
                <li>Proposition bets: High-payout, single-roll bets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Craps;
