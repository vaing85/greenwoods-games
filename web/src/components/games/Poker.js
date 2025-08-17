import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import styled, { keyframes } from 'styled-components';

const dealCard = keyframes`
  0% { transform: translateY(-100px) rotate(-10deg); opacity: 0; }
  100% { transform: translateY(0) rotate(0deg); opacity: 1; }
`;

const PokerContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
`;

const PokerTable = styled.div`
  background: linear-gradient(145deg, #0f5132, #1a6040);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin: 2rem 0;
  border: 3px solid #28a745;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const PlayerHand = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const CommunityCards = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
`;

const Card = styled.div`
  width: 80px;
  height: 120px;
  background: ${props => props.hidden ? '#1a1a1a' : 'white'};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid #333;
  color: ${props => props.color || '#000'};
  padding: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: ${props => props.animate ? dealCard : 'none'} 0.5s ease-out;
  
  ${props => props.hidden && `
    background-image: linear-gradient(45deg, #1a1a1a 25%, #333 25%, #333 50%, #1a1a1a 50%, #1a1a1a 75%, #333 75%);
    background-size: 8px 8px;
    color: #666;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const ActionButton = styled.button`
  background: ${props => {
    switch(props.action) {
      case 'fold': return 'linear-gradient(45deg, #dc3545, #c82333)';
      case 'call': return 'linear-gradient(45deg, #ffc107, #e0a800)';
      case 'raise': return 'linear-gradient(45deg, #28a745, #1e7e34)';
      default: return 'linear-gradient(45deg, #007bff, #0056b3)';
    }
  }};
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BetControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const BetSlider = styled.input`
  width: 200px;
  margin: 0 1rem;
`;

const GameInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HandRanking = styled.div`
  background: rgba(40, 167, 69, 0.2);
  border: 2px solid #28a745;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
`;

const Poker = ({ socket }) => {
  const { user, updateBalance } = useAuth();
  const [gameState, setGameState] = useState('waiting'); // waiting, preflop, flop, turn, river, showdown
  const [playerHand, setPlayerHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [currentBet, setCurrentBet] = useState(10);
  const [pot, setPot] = useState(0);
  const [playerBet, setPlayerBet] = useState(0);
  const [opponentBet, setOpponentBet] = useState(0);
  const [handRank, setHandRank] = useState('');
  const [gameResult, setGameResult] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(20);

  const minBet = 5;
  const maxBet = Math.min(500, user.balance);

  const handRankings = [
    'High Card', 'Pair', 'Two Pair', 'Three of a Kind',
    'Straight', 'Flush', 'Full House', 'Four of a Kind',
    'Straight Flush', 'Royal Flush'
  ];

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      
      socket.on('poker-game-state', (state) => {
        setGameState(state.phase);
        setPlayerHand(state.playerHand || []);
        setCommunityCards(state.communityCards || []);
        setPot(state.pot || 0);
        setPlayerBet(state.playerBet || 0);
        setOpponentBet(state.opponentBet || 0);
        setHandRank(state.handRank || '');
      });

      socket.on('poker-result', (result) => {
        setGameResult(result);
        if (result.winner === 'player') {
          updateBalance(user.balance + result.winAmount);
        }
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('poker-game-state');
        socket.off('poker-result');
      };
    }
  }, [socket, user.balance, updateBalance]);

  const startNewGame = useCallback(() => {
    if (user.balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }

    socket.emit('start-poker-game', { 
      bet: currentBet, 
      userId: user.id 
    });
    
    setGameResult(null);
    setPlayerHand([]);
    setCommunityCards([]);
    setPot(currentBet * 2); // Player + opponent ante
    setPlayerBet(currentBet);
    setOpponentBet(currentBet);
  }, [socket, currentBet, user.id, user.balance]);

  const handleAction = useCallback((action) => {
    let actionData = { action, userId: user.id };
    
    if (action === 'raise') {
      actionData.amount = raiseAmount;
    }
    
    socket.emit('poker-action', actionData);
  }, [socket, user.id, raiseAmount]);

  const getCardColor = (suit) => {
    return (suit === '♥' || suit === '♦') ? '#dc3545' : '#000';
  };

  const renderCard = (card, index, hidden = false) => (
    <Card 
      key={index} 
      hidden={hidden}
      color={card ? getCardColor(card.suit) : '#000'}
      animate={card && !hidden}
    >
      {!hidden && card ? (
        <>
          <div>{card.rank}</div>
          <div style={{ fontSize: '2rem' }}>{card.suit}</div>
          <div style={{ transform: 'rotate(180deg)' }}>{card.rank}</div>
        </>
      ) : (
        <div>🂠</div>
      )}
    </Card>
  );

  return (
    <PokerContainer>
      <h1>🃏 Texas Hold'em Poker</h1>
      <p>Connection Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      
      <PokerTable>
        {/* Community Cards */}
        <div>
          <h3>Community Cards</h3>
          <CommunityCards>
            {Array.from({ length: 5 }, (_, i) => 
              renderCard(communityCards[i], i, !communityCards[i])
            )}
          </CommunityCards>
        </div>

        {/* Game Info */}
        <GameInfo>
          <InfoCard>
            <h4>Pot</h4>
            <div style={{ fontSize: '1.5rem', color: '#28a745' }}>${pot}</div>
          </InfoCard>
          <InfoCard>
            <h4>Your Bet</h4>
            <div style={{ fontSize: '1.5rem', color: '#ffc107' }}>${playerBet}</div>
          </InfoCard>
          <InfoCard>
            <h4>Opponent Bet</h4>
            <div style={{ fontSize: '1.5rem', color: '#dc3545' }}>${opponentBet}</div>
          </InfoCard>
          <InfoCard>
            <h4>Game Phase</h4>
            <div style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{gameState}</div>
          </InfoCard>
        </GameInfo>

        {/* Player Hand */}
        <div>
          <h3>Your Hand</h3>
          <PlayerHand>
            {Array.from({ length: 2 }, (_, i) => 
              renderCard(playerHand[i], i, !playerHand[i])
            )}
          </PlayerHand>
          
          {handRank && (
            <HandRanking>
              <h4>Hand Ranking: {handRank}</h4>
            </HandRanking>
          )}
        </div>

        {/* Actions */}
        {gameState === 'waiting' ? (
          <div>
            <BetControls>
              <label>Ante: </label>
              <input
                type="range"
                min={minBet}
                max={maxBet}
                value={currentBet}
                onChange={(e) => setCurrentBet(parseInt(e.target.value))}
              />
              <span>${currentBet}</span>
            </BetControls>
            
            <ActionButton 
              onClick={startNewGame}
              disabled={!isConnected || user.balance < currentBet}
            >
              Start New Game (${currentBet})
            </ActionButton>
          </div>
        ) : gameState !== 'showdown' ? (
          <div>
            <BetControls>
              <label>Raise Amount: </label>
              <BetSlider
                type="range"
                min={minBet}
                max={Math.min(maxBet, user.balance - playerBet)}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              />
              <span>${raiseAmount}</span>
            </BetControls>
            
            <ActionButtons>
              <ActionButton action="fold" onClick={() => handleAction('fold')}>
                Fold
              </ActionButton>
              <ActionButton action="call" onClick={() => handleAction('call')}>
                Call ${Math.max(0, opponentBet - playerBet)}
              </ActionButton>
              <ActionButton action="raise" onClick={() => handleAction('raise')}>
                Raise ${raiseAmount}
              </ActionButton>
            </ActionButtons>
          </div>
        ) : null}

        {/* Game Result */}
        {gameResult && (
          <HandRanking style={{
            background: gameResult.winner === 'player' ? 
              'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)',
            borderColor: gameResult.winner === 'player' ? '#28a745' : '#dc3545'
          }}>
            <h3>
              {gameResult.winner === 'player' ? '🎉 You Win!' : '😔 You Lose'}
            </h3>
            <p>{gameResult.message}</p>
            {gameResult.winner === 'player' && (
              <p>You won ${gameResult.winAmount}!</p>
            )}
          </HandRanking>
        )}
      </PokerTable>

      {/* Hand Rankings Guide */}
      <HandRanking>
        <h3>Hand Rankings (Highest to Lowest)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {handRankings.reverse().map((rank, index) => (
            <div key={index} style={{ 
              padding: '0.5rem', 
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px'
            }}>
              {index + 1}. {rank}
            </div>
          ))}
        </div>
      </HandRanking>
    </PokerContainer>
  );
};

export default Poker;
