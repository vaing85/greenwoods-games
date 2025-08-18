import React, { useState, useRef } from 'react';
import './WheelOfFortune.css';

const WheelOfFortune = ({ socket }) => {
  const [balance, setBalance] = useState(10000);
  const [wheelSpins, setWheelSpins] = useState(0);
  const [wheelWins, setWheelWins] = useState(0);
  const [biggestWin, setBiggestWin] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameMessage, setGameMessage] = useState('Place your bet and spin the wheel!');
  const wheelRef = useRef(null);

  const prizes = [
    { min: 0, max: 30, prize: 500, name: "JACKPOT", color: "#ff0000" },
    { min: 30, max: 60, prize: 150, name: "Big Win", color: "#00ff00" },
    { min: 60, max: 90, prize: 100, name: "Good Win", color: "#0000ff" },
    { min: 90, max: 120, prize: 200, name: "Great Win", color: "#ffff00" },
    { min: 120, max: 150, prize: 75, name: "Small Win", color: "#ff00ff" },
    { min: 150, max: 180, prize: 300, name: "Mega Win", color: "#00ffff" },
    { min: 180, max: 210, prize: 125, name: "Nice Win", color: "#ff8000" },
    { min: 210, max: 240, prize: 50, name: "Mini Win", color: "#8000ff" },
    { min: 240, max: 270, prize: 175, name: "Super Win", color: "#ff0080" },
    { min: 270, max: 300, prize: 100, name: "Good Win", color: "#80ff00" },
    { min: 300, max: 330, prize: 250, name: "Amazing Win", color: "#0080ff" },
    { min: 330, max: 360, prize: 400, name: "MEGA JACKPOT", color: "#ff4000" }
  ];

  const spinWheel = (betAmount = 75) => {
    if (balance < betAmount) {
      setGameMessage('Insufficient balance!');
      return;
    }

    if (isSpinning) {
      setGameMessage('Wheel is already spinning!');
      return;
    }

    setBalance(prev => prev - betAmount);
    setWheelSpins(prev => prev + 1);
    setIsSpinning(true);
    setGameMessage('Spinning the wheel...');

    const wheel = wheelRef.current;
    const spinDegrees = 1800 + Math.random() * 1800; // 5-10 rotations
    wheel.style.transform = `rotate(${spinDegrees}deg)`;

    setTimeout(() => {
      const finalDegree = spinDegrees % 360;
      const winningPrize = prizes.find(p => finalDegree >= p.min && finalDegree < p.max);

      if (winningPrize) {
        const winAmount = Math.floor(winningPrize.prize * (betAmount / 75)); // Scale prize with bet
        setBalance(prev => prev + winAmount);
        setWheelWins(prev => prev + 1);
        
        if (winAmount > biggestWin) {
          setBiggestWin(winAmount);
        }

        setGameMessage(`🎡 ${winningPrize.name}! You won $${winAmount}!`);

        // Emit to server
        if (socket) {
          socket.emit('wheelWin', { 
            prize: winningPrize.name, 
            winAmount,
            betAmount 
          });
        }
      }

      setIsSpinning(false);
      wheel.style.transform = 'rotate(0deg)';
    }, 4000);
  };

  const megaSpin = () => {
    spinWheel(300); // 4x normal bet
  };

  return (
    <div className="wheel-fortune-container">
      <div className="game-header">
        <h2>🎡 Wheel of Fortune</h2>
        <div className="balance-display">
          Balance: ${balance.toLocaleString()}
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <div className="stat-value">{wheelSpins}</div>
          <div className="stat-label">Total Spins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{wheelWins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">${biggestWin.toLocaleString()}</div>
          <div className="stat-label">Biggest Win</div>
        </div>
      </div>

      <div className="wheel-container">
        <div className="wheel-wrapper">
          <div className="wheel-pointer"></div>
          <div className="fortune-wheel" ref={wheelRef}>
            <div className="wheel-center">SPIN</div>
            <div className="wheel-segments">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="wheel-segment"
                  style={{
                    transform: `rotate(${index * 30}deg)`,
                    background: prize.color
                  }}
                >
                  <div className="segment-text">
                    ${prize.prize}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button 
          className="spin-btn"
          onClick={() => spinWheel()}
          disabled={isSpinning}
        >
          {isSpinning ? 'Spinning...' : 'Spin $75'}
        </button>
        <button 
          className="mega-spin-btn"
          onClick={megaSpin}
          disabled={isSpinning}
        >
          {isSpinning ? 'Spinning...' : 'Mega Spin $300'}
        </button>
      </div>

      <div className="game-message">
        {gameMessage}
      </div>

      <div className="prize-table">
        <h4>Prize Table:</h4>
        <div className="prizes-grid">
          {prizes.map((prize, index) => (
            <div key={index} className="prize-item">
              <div 
                className="prize-color" 
                style={{ backgroundColor: prize.color }}
              ></div>
              <span className="prize-name">{prize.name}</span>
              <span className="prize-amount">${prize.prize}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WheelOfFortune;
