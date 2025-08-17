import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import styled from 'styled-components';

const BlackjackContainer = styled.div`
  text-align: center;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const GameTable = styled.div`
  background: #1a4d1a;
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  border: 3px solid #ff6b6b;
  min-height: 500px;
`;

const HandSection = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
`;

const HandTitle = styled.h3`
  color: ${props => props.dealer ? '#ff6b6b' : '#4CAF50'};
  margin-bottom: 1rem;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Card = styled.div`
  width: 80px;
  height: 120px;
  background: ${props => props.hidden ? '#333' : 'white'};
  color: ${props => props.hidden ? 'white' : 'black'};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  border: 2px solid #333;
  font-weight: bold;
`;

const CardRank = styled.div`
  font-size: 1rem;
  align-self: flex-start;
`;

const CardSuit = styled.div`
  font-size: 2rem;
  align-self: center;
  color: ${props => 
    props.suit === 'hearts' || props.suit === 'diamonds' ? '#ff0000' : '#000000'
  };
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin: 1rem 0;
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

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const ActionButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const GameStatus = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => 
    props.status === 'win' ? '#4CAF50' :
    props.status === 'lose' ? '#ff6b6b' :
    props.status === 'push' ? '#FFA500' : 'white'
  };
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
`;

const Blackjack = ({ socket }) => {
  const { user, updateBalance } = useAuth();
  const [gameState, setGameState] = useState({
    gameId: null,
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    gameStatus: 'betting', // 'betting', 'playing', 'dealer', 'finished'
    result: null
  });
  const [bet, setBet] = useState(10);
  const [loading, setLoading] = useState(false);

  const minBet = 5;
  const maxBet = 500;

  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  const dealNewGame = async () => {
    if (user.balance < bet) {
      alert('Insufficient balance!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/games/blackjack/deal', { bet });
      setGameState({
        ...response.data,
        gameStatus: 'playing',
        result: null
      });
      
      // Deduct bet from balance
      updateBalance(user.balance - bet);
    } catch (error) {
      console.error('Error dealing cards:', error);
      alert('Error starting game');
    }
    setLoading(false);
  };

  const hit = () => {
    // In a real implementation, this would call the server
    // For now, we'll simulate locally
    const newCard = generateRandomCard();
    const newPlayerHand = [...gameState.playerHand, newCard];
    const newScore = calculateScore(newPlayerHand);
    
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      playerScore: newScore,
      gameStatus: newScore > 21 ? 'finished' : 'playing',
      result: newScore > 21 ? 'lose' : null
    }));

    if (newScore > 21) {
      // Player busts - dealer wins
      // Balance already deducted when game started
    }
  };

  const stand = () => {
    // Dealer plays
    setGameState(prev => ({ ...prev, gameStatus: 'dealer' }));
    
    // Simulate dealer play
    setTimeout(() => {
      playDealerHand();
    }, 1000);
  };

  const playDealerHand = () => {
    let dealerHand = [...gameState.dealerHand];
    let dealerScore = calculateScore(dealerHand);
    
    // Reveal hidden card
    while (dealerScore < 17) {
      dealerHand.push(generateRandomCard());
      dealerScore = calculateScore(dealerHand);
    }
    
    // Determine winner
    const playerScore = gameState.playerScore;
    let result;
    let payout = 0;
    
    if (dealerScore > 21) {
      result = 'win';
      payout = bet * 2; // Return bet + winnings
    } else if (playerScore > dealerScore) {
      result = 'win';
      payout = bet * 2;
    } else if (playerScore < dealerScore) {
      result = 'lose';
      payout = 0;
    } else {
      result = 'push';
      payout = bet; // Return bet only
    }
    
    setGameState(prev => ({
      ...prev,
      dealerHand,
      dealerScore,
      gameStatus: 'finished',
      result
    }));
    
    // Update balance with payout
    if (payout > 0) {
      updateBalance(user.balance + payout - bet); // Adjust for already deducted bet
    }
  };

  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;
    
    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        score += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        score += 10;
      } else {
        score += parseInt(card.rank);
      }
    }
    
    // Handle aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const generateRandomCard = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    return {
      suit: suits[Math.floor(Math.random() * suits.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)]
    };
  };

  const adjustBet = (amount) => {
    const newBet = bet + amount;
    if (newBet >= minBet && newBet <= maxBet && newBet <= user.balance) {
      setBet(newBet);
    }
  };

  const renderCard = (card, index, isHidden = false) => {
    if (isHidden) {
      return (
        <Card key={index} hidden>
          <CardRank>?</CardRank>
          <CardSuit>?</CardSuit>
        </Card>
      );
    }
    
    return (
      <Card key={index}>
        <CardRank>{card.rank}</CardRank>
        <CardSuit suit={card.suit}>{suitSymbols[card.suit]}</CardSuit>
      </Card>
    );
  };

  return (
    <BlackjackContainer>
      <h1>🃏 Blackjack</h1>
      
      <GameTable>
        <HandSection>
          <HandTitle dealer>Dealer's Hand</HandTitle>
          <CardsContainer>
            {gameState.dealerHand.map((card, index) => 
              renderCard(card, index, gameState.gameStatus === 'playing' && index === 1)
            )}
          </CardsContainer>
          <Score>
            Score: {gameState.gameStatus === 'playing' ? '?' : gameState.dealerScore}
          </Score>
        </HandSection>

        <HandSection>
          <HandTitle>Your Hand</HandTitle>
          <CardsContainer>
            {gameState.playerHand.map((card, index) => renderCard(card, index))}
          </CardsContainer>
          <Score>Score: {gameState.playerScore}</Score>
        </HandSection>

        {gameState.gameStatus === 'betting' && (
          <>
            <BetControls>
              <BetButton onClick={() => adjustBet(-5)} disabled={bet <= minBet}>
                -$5
              </BetButton>
              <BetButton onClick={() => adjustBet(-1)} disabled={bet <= minBet}>
                -$1
              </BetButton>
              <BetAmount>Bet: ${bet}</BetAmount>
              <BetButton onClick={() => adjustBet(1)} disabled={bet >= maxBet || bet >= user.balance}>
                +$1
              </BetButton>
              <BetButton onClick={() => adjustBet(5)} disabled={bet >= maxBet || bet + 5 > user.balance}>
                +$5
              </BetButton>
            </BetControls>
            
            <ActionButtons>
              <ActionButton onClick={dealNewGame} disabled={loading || user.balance < bet}>
                {loading ? 'Dealing...' : 'Deal Cards'}
              </ActionButton>
            </ActionButtons>
          </>
        )}

        {gameState.gameStatus === 'playing' && (
          <ActionButtons>
            <ActionButton onClick={hit} disabled={gameState.playerScore >= 21}>
              Hit
            </ActionButton>
            <ActionButton onClick={stand}>
              Stand
            </ActionButton>
          </ActionButtons>
        )}

        {gameState.gameStatus === 'dealer' && (
          <GameStatus>Dealer is playing...</GameStatus>
        )}

        {gameState.gameStatus === 'finished' && gameState.result && (
          <>
            <GameStatus status={gameState.result}>
              {gameState.result === 'win' && '🎉 You Win!'}
              {gameState.result === 'lose' && '😔 You Lose!'}
              {gameState.result === 'push' && '🤝 Push - It\'s a tie!'}
            </GameStatus>
            
            <ActionButtons>
              <ActionButton onClick={() => setGameState({
                gameId: null,
                playerHand: [],
                dealerHand: [],
                playerScore: 0,
                dealerScore: 0,
                gameStatus: 'betting',
                result: null
              })}>
                Play Again
              </ActionButton>
            </ActionButtons>
          </>
        )}
      </GameTable>
    </BlackjackContainer>
  );
};

export default Blackjack;
