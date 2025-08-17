import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(1800deg); }
`;

const RouletteContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GameTable = styled.div`
  background: #1a4d1a;
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  border: 3px solid #ff6b6b;
`;

const WheelContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const Wheel = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #ff0000 0deg 9.73deg,
    #000000 9.73deg 19.46deg,
    #ff0000 19.46deg 29.19deg,
    #000000 29.19deg 38.92deg,
    #ff0000 38.92deg 48.65deg,
    #000000 48.65deg 58.38deg,
    #ff0000 58.38deg 68.11deg,
    #000000 68.11deg 77.84deg,
    #ff0000 77.84deg 87.57deg,
    #000000 87.57deg 97.3deg,
    #008000 97.3deg 107.03deg,
    #ff0000 107.03deg 116.76deg,
    #000000 116.76deg 126.49deg,
    #ff0000 126.49deg 136.22deg,
    #000000 136.22deg 145.95deg,
    #ff0000 145.95deg 155.68deg,
    #000000 155.68deg 165.41deg,
    #ff0000 165.41deg 175.14deg,
    #000000 175.14deg 184.87deg,
    #ff0000 184.87deg 194.6deg,
    #000000 194.6deg 204.33deg,
    #ff0000 204.33deg 214.06deg,
    #000000 214.06deg 223.79deg,
    #ff0000 223.79deg 233.52deg,
    #000000 233.52deg 243.25deg,
    #ff0000 243.25deg 252.98deg,
    #000000 252.98deg 262.71deg,
    #ff0000 262.71deg 272.44deg,
    #000000 272.44deg 282.17deg,
    #ff0000 282.17deg 291.9deg,
    #000000 291.9deg 301.63deg,
    #ff0000 301.63deg 311.36deg,
    #000000 311.36deg 321.09deg,
    #ff0000 321.09deg 330.82deg,
    #000000 330.82deg 340.55deg,
    #ff0000 340.55deg 350.28deg,
    #000000 350.28deg 360deg
  );
  border: 5px solid #ffd700;
  position: relative;
  animation: ${props => props.spinning ? spin : 'none'} 3s ease-out;
`;

const WheelCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #ffd700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: black;
`;

const BettingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 5px;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const NumberButton = styled.button`
  width: 60px;
  height: 60px;
  border: 2px solid #fff;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  background: ${props => 
    props.number === 0 ? '#008000' :
    props.isRed ? '#ff0000' : '#000000'
  };
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  &.selected {
    box-shadow: 0 0 15px #ffd700;
    border-color: #ffd700;
  }
`;

const ColorBetButton = styled.button`
  padding: 1rem 2rem;
  margin: 0.5rem;
  border: 2px solid #fff;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  background: ${props => 
    props.color === 'red' ? '#ff0000' :
    props.color === 'black' ? '#000000' :
    '#008000'
  };
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &.selected {
    box-shadow: 0 0 15px #ffd700;
    border-color: #ffd700;
  }
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
  padding: 2rem;
  border-radius: 10px;
  background: ${props => 
    props.isWin ? 'linear-gradient(45deg, #4CAF50, #45a049)' : 
    'rgba(255, 255, 255, 0.1)'
  };
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const CurrentBets = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
`;

const Roulette = ({ socket }) => {
  const { user, updateBalance } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [currentBets, setCurrentBets] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBets, setSelectedBets] = useState([]);

  const minBet = 1;
  const maxBet = 1000;

  // Roulette numbers and their colors
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36

  const isRed = (number) => redNumbers.includes(number);

  const placeBet = (type, value) => {
    if (spinning) return;
    
    const totalBetAmount = currentBets.reduce((sum, bet) => sum + bet.amount, 0) + betAmount;
    if (totalBetAmount > user.balance) {
      alert('Insufficient balance!');
      return;
    }

    const newBet = {
      type,
      value,
      amount: betAmount,
      id: Date.now()
    };

    setCurrentBets(prev => [...prev, newBet]);
    setSelectedBets(prev => [...prev, `${type}-${value}`]);
  };

  const removeBet = (betId) => {
    if (spinning) return;
    
    setCurrentBets(prev => prev.filter(bet => bet.id !== betId));
    const bet = currentBets.find(b => b.id === betId);
    if (bet) {
      setSelectedBets(prev => prev.filter(sb => sb !== `${bet.type}-${bet.value}`));
    }
  };

  const clearBets = () => {
    if (spinning) return;
    setCurrentBets([]);
    setSelectedBets([]);
  };

  const handleSpin = async () => {
    if (currentBets.length === 0) {
      alert('Please place at least one bet!');
      return;
    }

    const totalBetAmount = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBetAmount > user.balance) {
      alert('Insufficient balance!');
      return;
    }

    setSpinning(true);
    setLastResult(null);

    try {
      // Deduct bet amount from balance
      updateBalance(user.balance - totalBetAmount);

      // Simulate roulette spin
      const response = await axios.post('/api/games/roulette/spin', {
        bets: currentBets
      });

      // Simulate wheel spinning animation
      setTimeout(() => {
        const winningNum = response.data.winningNumber;
        setWinningNumber(winningNum);
        
        // Calculate total winnings
        let totalWinnings = 0;
        currentBets.forEach(bet => {
          const payout = calculatePayout(bet, winningNum, response.data.color);
          totalWinnings += payout;
        });

        setLastResult({
          winningNumber: winningNum,
          color: response.data.color,
          totalWinnings,
          isWin: totalWinnings > 0
        });

        // Update balance with winnings
        if (totalWinnings > 0) {
          updateBalance(user.balance - totalBetAmount + totalWinnings);
        }

        setSpinning(false);
      }, 3000);

    } catch (error) {
      console.error('Error spinning roulette:', error);
      setSpinning(false);
      // Restore balance on error
      updateBalance(user.balance + totalBetAmount);
    }
  };

  const calculatePayout = (bet, winningNumber, winningColor) => {
    if (bet.type === 'number' && bet.value === winningNumber) {
      return bet.amount * 35; // 35:1 payout for straight number
    }
    if (bet.type === 'color' && bet.value === winningColor) {
      return bet.amount * 2; // 1:1 payout for color
    }
    // Add more bet types as needed (odd/even, high/low, etc.)
    return 0;
  };

  const adjustBetAmount = (amount) => {
    const newAmount = betAmount + amount;
    if (newAmount >= minBet && newAmount <= maxBet) {
      setBetAmount(newAmount);
    }
  };

  const getNumberColor = (number) => {
    if (number === 0) return 'green';
    return isRed(number) ? 'red' : 'black';
  };

  return (
    <RouletteContainer>
      <h1>🎲 Roulette</h1>
      
      <GameTable>
        <WheelContainer>
          <Wheel spinning={spinning}>
            <WheelCenter>
              {winningNumber !== null ? winningNumber : '🎯'}
            </WheelCenter>
          </Wheel>
        </WheelContainer>

        <BetControls>
          <BetButton onClick={() => adjustBetAmount(-5)} disabled={betAmount <= minBet}>
            -$5
          </BetButton>
          <BetButton onClick={() => adjustBetAmount(-1)} disabled={betAmount <= minBet}>
            -$1
          </BetButton>
          <BetAmount>Bet Amount: ${betAmount}</BetAmount>
          <BetButton onClick={() => adjustBetAmount(1)} disabled={betAmount >= maxBet}>
            +$1
          </BetButton>
          <BetButton onClick={() => adjustBetAmount(5)} disabled={betAmount >= maxBet}>
            +$5
          </BetButton>
        </BetControls>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Color Bets</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <ColorBetButton 
              color="red" 
              onClick={() => placeBet('color', 'red')}
              className={selectedBets.includes('color-red') ? 'selected' : ''}
            >
              Red
            </ColorBetButton>
            <ColorBetButton 
              color="black" 
              onClick={() => placeBet('color', 'black')}
              className={selectedBets.includes('color-black') ? 'selected' : ''}
            >
              Black
            </ColorBetButton>
            <ColorBetButton 
              color="green" 
              onClick={() => placeBet('number', 0)}
              className={selectedBets.includes('number-0') ? 'selected' : ''}
            >
              0
            </ColorBetButton>
          </div>
        </div>

        <div>
          <h3>Number Bets</h3>
          <BettingGrid>
            {numbers.slice(1).map(number => (
              <NumberButton
                key={number}
                number={number}
                isRed={isRed(number)}
                onClick={() => placeBet('number', number)}
                className={selectedBets.includes(`number-${number}`) ? 'selected' : ''}
              >
                {number}
              </NumberButton>
            ))}
          </BettingGrid>
        </div>

        {currentBets.length > 0 && (
          <CurrentBets>
            <h3>Current Bets</h3>
            {currentBets.map(bet => (
              <div key={bet.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '0.5rem 0',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '5px'
              }}>
                <span>
                  {bet.type === 'number' ? `Number ${bet.value}` : `${bet.value} color`} - ${bet.amount}
                </span>
                <button 
                  onClick={() => removeBet(bet.id)}
                  style={{ 
                    background: '#ff6b6b', 
                    border: 'none', 
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <strong>Total Bet: ${currentBets.reduce((sum, bet) => sum + bet.amount, 0)}</strong>
            </div>
            <button 
              onClick={clearBets}
              style={{ 
                background: '#444', 
                border: '1px solid #666', 
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              Clear All Bets
            </button>
          </CurrentBets>
        )}

        <SpinButton 
          onClick={handleSpin} 
          disabled={spinning || currentBets.length === 0}
        >
          {spinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
        </SpinButton>

        {lastResult && (
          <ResultDisplay isWin={lastResult.isWin}>
            Winning Number: {lastResult.winningNumber} ({lastResult.color})
            <br />
            {lastResult.isWin 
              ? `🎉 You won $${lastResult.totalWinnings}!`
              : '😔 No wins this time. Better luck next spin!'
            }
          </ResultDisplay>
        )}
      </GameTable>
    </RouletteContainer>
  );
};

export default Roulette;
