import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import { soundManager } from '../../utils/SoundManager';
import { 
  Confetti, 
  WinAnimation, 
  SlotSpinEffect, 
  ParticleBurst,
  FloatingNumber,
  GlowEffect,
  ButtonPressEffect
} from '../effects/VisualEffects';

const spin = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

const SlotContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const SlotMachineFrame = styled.div`
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin: 2rem 0;
  border: 3px solid #ff6b6b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const ReelsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const Reel = styled.div`
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  border: 3px solid #333;
  animation: ${props => props.spinning ? spin : 'none'} 0.1s infinite;
`;

const BetControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const BetButton = styled.button`
  background: #444;
  border: 1px solid #666;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: #555;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BetAmount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff6b6b;
  margin: 0 1rem;
`;

const SpinButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem 3rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem 0;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultDisplay = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 10px;
  background: ${props => 
    props.isWin ? 'linear-gradient(45deg, #4CAF50, #45a049)' : 
    'rgba(255, 255, 255, 0.1)'
  };
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`;

const PayTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  margin-top: 2rem;
  text-align: left;
`;

const PayTableTitle = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
  color: #ff6b6b;
`;

const PayTableRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ThemeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const ThemeButton = styled.button`
  background: ${props => props.active ? props.themeColor : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.themeColor};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.themeColor};
    transform: scale(1.05);
  }
`;

const JackpotDisplay = styled.div`
  text-align: center;
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  border-radius: 15px;
  color: #000;
  font-weight: bold;
`;

const JackpotAmount = styled.div`
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const AutoSpinControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const AutoSpinButton = styled.button`
  background: ${props => props.active ? '#4CAF50' : '#444'};
  border: 1px solid ${props => props.active ? '#45a049' : '#666'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#45a049' : '#555'};
  }
`;

const SlotMachine = ({ socket }) => {
  const { user, updateBalance } = useAuth();
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastResult, setLastResult] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [jackpot, setJackpot] = useState(125750);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [buttonPressed, setButtonPressed] = useState(false);

  const themes = {
    classic: {
      name: 'Classic Fruits',
      symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'],
      background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
      color: '#ff6b6b'
    },
    egyptian: {
      name: 'Egyptian Gold',
      symbols: ['🏺', '👑', '🐍', '🔺', '🧿', '💰', '⚱️'],
      background: 'linear-gradient(145deg, #8B4513, #654321)',
      color: '#FFD700'
    },
    ocean: {
      name: 'Ocean Treasures',
      symbols: ['🐚', '🦑', '🐙', '🏴‍☠️', '⚓', '💎', '🌊'],
      background: 'linear-gradient(145deg, #006994, #003d5c)',
      color: '#00CED1'
    },
    space: {
      name: 'Cosmic Fortune',
      symbols: ['🛸', '🌟', '🚀', '👽', '🌙', '💫', '🪐'],
      background: 'linear-gradient(145deg, #2c3e50, #34495e)',
      color: '#9b59b6'
    }
  };

  const symbols = themes[selectedTheme].symbols;
  const minBet = 1;
  const maxBet = 500;

  const handleSpin = useCallback(() => {
    if (user.balance < bet) {
      alert('Insufficient balance!');
      return;
    }

    // Sound effect for spin start
    if (soundEnabled) {
      soundManager.initializeOnUserGesture();
      soundManager.playSound('spin');
    }

    // Button press effect
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 100);

    setSpinning(true);
    setLastResult(null);
    setShowParticles(true);
    
    // Show spinning animation
    const spinInterval = setInterval(() => {
      setReels(prev => [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    // Send spin request to server
    socket.emit('spin-slot', { bet, userId: user.id });

    // Stop local animation after 2 seconds
    setTimeout(() => {
      clearInterval(spinInterval);
      setShowParticles(false);
    }, 2000);
  }, [user.balance, bet, symbols, socket, user.id, soundEnabled]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      
      socket.on('slot-result', (result) => {
        setReels(result.reels);
        setLastResult(result);
        setSpinning(false);
        
        if (result.isWin) {
          const winAmount = bet * result.multiplier;
          updateBalance(user.balance + winAmount);
          
          // Sound and visual effects for wins
          if (soundEnabled) {
            if (result.multiplier >= 100) {
              soundManager.playSound('jackpot');
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            } else {
              soundManager.playSound('win');
            }
          }
          
          // Show floating win amount
          const newFloatingNumber = {
            id: Date.now(),
            amount: winAmount,
            positive: true
          };
          setFloatingNumbers(prev => [...prev, newFloatingNumber]);
          setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(num => num.id !== newFloatingNumber.id));
          }, 2000);
          
          // Check for jackpot win (if all symbols match the highest value)
          if (result.multiplier === 100) {
            updateBalance(user.balance + winAmount + jackpot);
            setJackpot(50000); // Reset jackpot
          }
        } else {
          updateBalance(user.balance - bet);
          
          // Sound effect for loss
          if (soundEnabled) {
            soundManager.playSound('lose');
          }
          
          // Show floating loss amount
          const newFloatingNumber = {
            id: Date.now(),
            amount: bet,
            positive: false
          };
          setFloatingNumbers(prev => [...prev, newFloatingNumber]);
          setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(num => num.id !== newFloatingNumber.id));
          }, 2000);
        }
        
        // Auto-spin logic
        if (autoSpin && autoSpinCount > 1) {
          setAutoSpinCount(autoSpinCount - 1);
          setTimeout(() => {
            handleSpin();
          }, 1500);
        } else if (autoSpin && autoSpinCount === 1) {
          setAutoSpin(false);
          setAutoSpinCount(0);
        }
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('slot-result');
      };
    }
  }, [socket, bet, user.balance, updateBalance, autoSpin, autoSpinCount, jackpot, handleSpin, soundEnabled]);

  // Jackpot increment effect
  useEffect(() => {
    const jackpotInterval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 10) + 1);
    }, 3000);

    return () => clearInterval(jackpotInterval);
  }, []);

  const adjustBet = (amount) => {
    const newBet = bet + amount;
    if (newBet >= minBet && newBet <= maxBet && newBet <= user.balance) {
      setBet(newBet);
    }
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    setReels([themes[theme].symbols[0], themes[theme].symbols[0], themes[theme].symbols[0]]);
  };

  const toggleAutoSpin = () => {
    setAutoSpin(!autoSpin);
    if (!autoSpin) {
      setAutoSpinCount(10); // Default 10 spins
    } else {
      setAutoSpinCount(0);
    }
  };

  const payTable = [
    { symbol: `${symbols[0]}${symbols[0]}${symbols[0]}`, multiplier: 2 },
    { symbol: `${symbols[1]}${symbols[1]}${symbols[1]}`, multiplier: 3 },
    { symbol: `${symbols[2]}${symbols[2]}${symbols[2]}`, multiplier: 4 },
    { symbol: `${symbols[3]}${symbols[3]}${symbols[3]}`, multiplier: 5 },
    { symbol: `${symbols[4]}${symbols[4]}${symbols[4]}`, multiplier: 10 },
    { symbol: `${symbols[5]}${symbols[5]}${symbols[5]}`, multiplier: 25 },
    { symbol: `${symbols[6]}${symbols[6]}${symbols[6]}`, multiplier: 100 }
  ];

  return (
    <SlotContainer>
      {/* Confetti for big wins */}
      <Confetti show={showConfetti} />
      
      {/* Floating win/loss numbers */}
      {floatingNumbers.map(num => (
        <FloatingNumber
          key={num.id}
          positive={num.positive}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {num.positive ? '+' : '-'}${num.amount}
        </FloatingNumber>
      ))}

      <h1>🎰 {themes[selectedTheme].name}</h1>
      <p>Connection Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      
      {/* Sound Control */}
      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (soundEnabled) {
              soundManager.playSound('click');
            }
          }}
          style={{
            background: soundEnabled ? '#4CAF50' : '#666',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
      </div>
      
      <GlowEffect active={lastResult?.isWin && lastResult?.multiplier >= 100}>
        <JackpotDisplay>
          <div>💰 PROGRESSIVE JACKPOT 💰</div>
          <JackpotAmount>${jackpot.toLocaleString()}</JackpotAmount>
        </JackpotDisplay>
      </GlowEffect>

      <ThemeSelector>
        {Object.entries(themes).map(([key, theme]) => (
          <ThemeButton
            key={key}
            active={selectedTheme === key}
            themeColor={theme.color}
            onClick={() => {
              handleThemeChange(key);
              if (soundEnabled) soundManager.playSound('click');
            }}
          >
            {theme.name}
          </ThemeButton>
        ))}
      </ThemeSelector>
      
      <SlotMachineFrame style={{ 
        background: themes[selectedTheme].background,
        borderColor: themes[selectedTheme].color 
      }}>
        <ReelsContainer>
          {reels.map((symbol, index) => (
            <SlotSpinEffect key={index} spinning={spinning}>
              <WinAnimation key={`${symbol}-${index}`}>
                <Reel spinning={spinning}>
                  {symbol}
                </Reel>
              </WinAnimation>
            </SlotSpinEffect>
          ))}
        </ReelsContainer>

        {/* Particle effects during spinning */}
        {showParticles && <ParticleBurst show={true} x={50} y={50} count={5} />}

        <BetControls>
          <BetButton onClick={() => adjustBet(-10)} disabled={spinning || bet <= minBet}>
            -$10
          </BetButton>
          <BetButton onClick={() => adjustBet(-5)} disabled={spinning || bet <= minBet}>
            -$5
          </BetButton>
          <BetButton onClick={() => adjustBet(-1)} disabled={spinning || bet <= minBet}>
            -$1
          </BetButton>
          <BetAmount style={{ color: themes[selectedTheme].color }}>Bet: ${bet}</BetAmount>
          <BetButton onClick={() => adjustBet(1)} disabled={spinning || bet >= maxBet || bet >= user.balance}>
            +$1
          </BetButton>
          <BetButton onClick={() => adjustBet(5)} disabled={spinning || bet >= maxBet || bet + 5 > user.balance}>
            +$5
          </BetButton>
          <BetButton onClick={() => adjustBet(10)} disabled={spinning || bet >= maxBet || bet + 10 > user.balance}>
            +$10
          </BetButton>
        </BetControls>

        <AutoSpinControls>
          <AutoSpinButton 
            active={autoSpin}
            onClick={toggleAutoSpin}
          >
            {autoSpin ? `Auto Spin (${autoSpinCount})` : 'Auto Spin'}
          </AutoSpinButton>
          <span style={{ color: themes[selectedTheme].color }}>
            Balance: ${user.balance}
          </span>
        </AutoSpinControls>

        <ButtonPressEffect pressed={buttonPressed}>
          <SpinButton 
            onClick={handleSpin} 
            disabled={spinning || !isConnected || user.balance < bet}
            style={{ 
              background: `linear-gradient(45deg, ${themes[selectedTheme].color}, ${themes[selectedTheme].color}dd)` 
            }}
          >
            {spinning ? 'SPINNING...' : 'SPIN'}
          </SpinButton>
        </ButtonPressEffect>

        {lastResult && (
          <ResultDisplay isWin={lastResult.isWin}>
            {lastResult.isWin 
              ? `🎉 WIN! ${lastResult.multiplier}x multiplier - You won $${bet * lastResult.multiplier}!`
              : `😔 No win this time. Better luck next spin!`
            }
          </ResultDisplay>
        )}
      </SlotMachineFrame>

      <PayTable>
        <PayTableTitle style={{ color: themes[selectedTheme].color }}>
          {themes[selectedTheme].name} Pay Table
        </PayTableTitle>
        {payTable.map((entry, index) => (
          <PayTableRow key={index}>
            <span>{entry.symbol}</span>
            <span style={{ color: themes[selectedTheme].color }}>{entry.multiplier}x</span>
          </PayTableRow>
        ))}
      </PayTable>
    </SlotContainer>
  );
};

export default SlotMachine;
