import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const WelcomeSection = styled.section`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
`;

const GameSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #fff;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;

const GameCard = styled(Link)`
  display: block;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2rem;
  text-decoration: none;
  color: white;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const GameIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const GameTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const GameDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StatsSection = styled.section`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 2rem;
  margin-top: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b6b;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
`;

const Dashboard = ({ socket }) => {
  const [games, setGames] = useState({
    slots: [],
    table: [],
    card: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>Welcome to Greenwood Games</Title>
        <Subtitle>Choose your game and start winning!</Subtitle>
      </WelcomeSection>

      <GameSection>
        <SectionTitle>🎰 Slot Machines</SectionTitle>
        <GameGrid>
          {games.slots.map(game => (
            <GameCard key={game.id} to={`/games/slots?game=${game.id}`}>
              <GameIcon>🎰</GameIcon>
              <GameTitle>{game.name}</GameTitle>
              <GameDescription>
                Spin the reels and hit the jackpot!
              </GameDescription>
              <GameInfo>
                <span>Min Bet: ${game.minBet}</span>
                <span>Max Bet: ${game.maxBet}</span>
              </GameInfo>
            </GameCard>
          ))}
        </GameGrid>
      </GameSection>

      <GameSection>
        <SectionTitle>🃏 Table Games</SectionTitle>
        <GameGrid>
          {games.table.map(game => (
            <GameCard key={game.id} to={`/games/${game.id}`}>
              <GameIcon>
                {game.id === 'blackjack' ? '🃏' : 
                 game.id === 'roulette' ? '🎲' : '🎯'}
              </GameIcon>
              <GameTitle>{game.name}</GameTitle>
              <GameDescription>
                {game.id === 'blackjack' ? 'Beat the dealer to 21!' :
                 game.id === 'roulette' ? 'Place your bets on the wheel!' :
                 'High stakes card game!'}
              </GameDescription>
              <GameInfo>
                <span>Min Bet: ${game.minBet}</span>
                <span>Max Bet: ${game.maxBet}</span>
              </GameInfo>
            </GameCard>
          ))}
        </GameGrid>
      </GameSection>

      <GameSection>
        <SectionTitle>🎮 Card Games</SectionTitle>
        <GameGrid>
          {games.card.map(game => (
            <GameCard key={game.id} to={`/games/${game.id}`}>
              <GameIcon>🎮</GameIcon>
              <GameTitle>{game.name}</GameTitle>
              <GameDescription>
                {game.id === 'poker' ? 'Texas Hold\'em Poker!' : 'Video Poker variations!'}
              </GameDescription>
              <GameInfo>
                <span>Min Bet: ${game.minBet}</span>
                <span>Max Bet: ${game.maxBet}</span>
              </GameInfo>
            </GameCard>
          ))}
        </GameGrid>
      </GameSection>

      <GameSection>
        <SectionTitle>🎯 Multiplayer Features</SectionTitle>
        <GameGrid>
          <GameCard to="/games/live-poker">
            <GameIcon>🃏</GameIcon>
            <GameTitle>Live Poker Rooms</GameTitle>
            <GameDescription>
              Join live multiplayer poker rooms and play with real players!
            </GameDescription>
            <GameInfo>
              <span>Real-time play</span>
              <span>Multiple rooms</span>
            </GameInfo>
          </GameCard>
          <GameCard to="/tournaments">
            <GameIcon>🏆</GameIcon>
            <GameTitle>Tournaments</GameTitle>
            <GameDescription>
              Compete in scheduled poker tournaments for bigger prizes!
            </GameDescription>
            <GameInfo>
              <span>Scheduled events</span>
              <span>Prize pools</span>
            </GameInfo>
          </GameCard>
        </GameGrid>
      </GameSection>

      <GameSection>
        <SectionTitle>🎯 New Phase 4 Games</SectionTitle>
        <GameGrid>
          <GameCard to="/games/baccarat">
            <GameIcon>🎯</GameIcon>
            <GameTitle>Baccarat</GameTitle>
            <GameDescription>
              Classic casino card game - bet on Player, Banker, or Tie!
            </GameDescription>
            <GameInfo>
              <span>Player: 1:1</span>
              <span>Tie: 8:1</span>
            </GameInfo>
          </GameCard>
          <GameCard to="/games/craps">
            <GameIcon>🎲</GameIcon>
            <GameTitle>Craps</GameTitle>
            <GameDescription>
              Exciting dice game with multiple betting options!
            </GameDescription>
            <GameInfo>
              <span>Pass Line</span>
              <span>Field Bets</span>
            </GameInfo>
          </GameCard>
          <GameCard to="/games/video-poker">
            <GameIcon>🃏</GameIcon>
            <GameTitle>Video Poker</GameTitle>
            <GameDescription>
              Multiple variants including Jacks or Better and Deuces Wild!
            </GameDescription>
            <GameInfo>
              <span>5-Card Draw</span>
              <span>Max: 4000x</span>
            </GameInfo>
          </GameCard>
        </GameGrid>
      </GameSection>

      <StatsSection>
        <SectionTitle>Your Stats</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Games Played</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>$0</StatValue>
            <StatLabel>Total Winnings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0%</StatValue>
            <StatLabel>Win Rate</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>🏆</StatValue>
            <StatLabel>Achievements</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>
    </DashboardContainer>
  );
};

export default Dashboard;
