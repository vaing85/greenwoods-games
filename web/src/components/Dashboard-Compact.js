import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const DashboardContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  overflow-y: auto;
  position: relative;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 1rem;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 15px;
  margin-bottom: 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #fff;
  animation: ${float} 3s ease-in-out infinite;
`;

const HeroSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Section = styled.section`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
`;

const GameCard = styled(Link)`
  display: block;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.25);
  }
`;

const GameIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const GameTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.3rem 0;
  color: #fff;
`;

const GameDescription = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem;
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
`;

const FeatureTitle = styled.h4`
  font-size: 0.9rem;
  margin: 0 0 0.3rem 0;
  color: #fff;
`;

const FeatureDescription = styled.p`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const PromoCard = styled.div`
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
`;

const PromoTitle = styled.h4`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
`;

const PromoDescription = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const JackpotAmount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin: 1rem 0;
  animation: ${shimmer} 2s infinite linear;
`;

const PlayButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const QuickPlayGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const Dashboard = ({ socket }) => {
  const [games, setGames] = useState({
    slots: [],
    table: [],
    card: []
  });
  const [loading, setLoading] = useState(true);
  const [jackpotAmount, setJackpotAmount] = useState(34564.84);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.random() * 10);
    }, 3000);
    return () => clearInterval(interval);
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
      <ContentContainer>
        {/* Hero Section */}
        <HeroSection>
          <HeroTitle>🏆 Greenwood Games 🏆</HeroTitle>
          <HeroSubtitle>Where Epic Wins Meet Epic Games!</HeroSubtitle>
        </HeroSection>

        {/* Main Content Grid */}
        <MainGrid>
          {/* Left Column - Games */}
          <LeftColumn>
            {/* Popular Games */}
            <Section>
              <SectionTitle>⭐ Popular Games</SectionTitle>
              <GameGrid>
                <GameCard to="/games/fish-hunter">
                  <GameIcon>🐠</GameIcon>
                  <GameTitle>Fish Hunter</GameTitle>
                  <GameDescription>Ocean shooting arcade</GameDescription>
                  <GameInfo>
                    <span>🎯 Arcade</span>
                    <span>🤖 Auto</span>
                  </GameInfo>
                </GameCard>
                <GameCard to="/games/dragon-tiger">
                  <GameIcon>🐉</GameIcon>
                  <GameTitle>Dragon Tiger</GameTitle>
                  <GameDescription>Fast card battle</GameDescription>
                  <GameInfo>
                    <span>⚡ Quick</span>
                    <span>💰 High</span>
                  </GameInfo>
                </GameCard>
                <GameCard to="/games/wheel-fortune">
                  <GameIcon>🎡</GameIcon>
                  <GameTitle>Wheel Fortune</GameTitle>
                  <GameDescription>Spin for prizes</GameDescription>
                  <GameInfo>
                    <span>🎁 12 Prizes</span>
                    <span>💫 Mega</span>
                  </GameInfo>
                </GameCard>
                <GameCard to="/games/blackjack">
                  <GameIcon>🃏</GameIcon>
                  <GameTitle>Blackjack</GameTitle>
                  <GameDescription>Beat the dealer</GameDescription>
                  <GameInfo>
                    <span>Min: $1</span>
                    <span>Max: $500</span>
                  </GameInfo>
                </GameCard>
              </GameGrid>
            </Section>

            {/* All Games */}
            <Section style={{ flex: 1 }}>
              <SectionTitle>🎰 Casino Games</SectionTitle>
              <GameGrid>
                {games.slots.map(game => (
                  <GameCard key={game.id} to={`/games/slots?game=${game.id}`}>
                    <GameIcon>🎰</GameIcon>
                    <GameTitle>{game.name}</GameTitle>
                    <GameDescription>Spin & win</GameDescription>
                    <GameInfo>
                      <span>${game.minBet}</span>
                      <span>${game.maxBet}</span>
                    </GameInfo>
                  </GameCard>
                ))}
                
                {games.table.map(game => (
                  <GameCard key={game.id} to={`/games/${game.id}`}>
                    <GameIcon>
                      {game.id === 'blackjack' ? '🃏' : 
                       game.id === 'roulette' ? '🎲' : '🎯'}
                    </GameIcon>
                    <GameTitle>{game.name}</GameTitle>
                    <GameDescription>Table classic</GameDescription>
                    <GameInfo>
                      <span>${game.minBet}</span>
                      <span>${game.maxBet}</span>
                    </GameInfo>
                  </GameCard>
                ))}

                <GameCard to="/games/baccarat">
                  <GameIcon>🎯</GameIcon>
                  <GameTitle>Baccarat</GameTitle>
                  <GameDescription>Player vs Banker</GameDescription>
                  <GameInfo>
                    <span>1:1</span>
                    <span>8:1 Tie</span>
                  </GameInfo>
                </GameCard>
                <GameCard to="/games/craps">
                  <GameIcon>🎲</GameIcon>
                  <GameTitle>Craps</GameTitle>
                  <GameDescription>Dice excitement</GameDescription>
                  <GameInfo>
                    <span>Pass</span>
                    <span>Field</span>
                  </GameInfo>
                </GameCard>
                <GameCard to="/games/video-poker">
                  <GameIcon>🃏</GameIcon>
                  <GameTitle>Video Poker</GameTitle>
                  <GameDescription>5-Card Draw</GameDescription>
                  <GameInfo>
                    <span>Jacks+</span>
                    <span>4000x</span>
                  </GameInfo>
                </GameCard>
              </GameGrid>
            </Section>
          </LeftColumn>

          {/* Right Column - Features & Promotions */}
          <RightColumn>
            {/* Features */}
            <Section>
              <SectionTitle>🏆 Features</SectionTitle>
              <FeatureGrid>
                <FeatureCard>
                  <FeatureIcon>👑</FeatureIcon>
                  <FeatureTitle>HD Games</FeatureTitle>
                  <FeatureDescription>Epic wins!</FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon>🎧</FeatureIcon>
                  <FeatureTitle>24/7 Support</FeatureTitle>
                  <FeatureDescription>Always here!</FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon>🎁</FeatureIcon>
                  <FeatureTitle>Daily Offers</FeatureTitle>
                  <FeatureDescription>Extra entries!</FeatureDescription>
                </FeatureCard>
                <FeatureCard>
                  <FeatureIcon>🎊</FeatureIcon>
                  <FeatureTitle>Promotions</FeatureTitle>
                  <FeatureDescription>Never stop!</FeatureDescription>
                </FeatureCard>
              </FeatureGrid>
            </Section>

            {/* Promotions */}
            <Section>
              <SectionTitle>📢 Promotions</SectionTitle>
              <PromoCard>
                <PromoTitle>🎡 DAILY WHEEL</PromoTitle>
                <PromoDescription>Up to 12,500 Entries daily!</PromoDescription>
              </PromoCard>
              <PromoCard>
                <PromoTitle>🐠 FISH TOURNAMENT</PromoTitle>
                <PromoDescription>49 Battles daily - Join anytime!</PromoDescription>
              </PromoCard>
            </Section>

            {/* Jackpot */}
            <Section>
              <SectionTitle>🎣 Fishing Jackpot</SectionTitle>
              <JackpotAmount>${jackpotAmount.toFixed(2)}</JackpotAmount>
              <PlayButton to="/games/fish-hunter">🎣 JOIN NOW</PlayButton>
            </Section>

            {/* Quick Play */}
            <Section>
              <SectionTitle>▶️ Quick Play</SectionTitle>
              <QuickPlayGrid>
                <PlayButton to="/games/slots">🎰 SLOTS</PlayButton>
                <PlayButton to="/games/fish-hunter">🐠 FISH</PlayButton>
                <PlayButton to="/games/blackjack">🃏 21</PlayButton>
                <PlayButton to="/games/roulette">🎲 SPIN</PlayButton>
              </QuickPlayGrid>
            </Section>
          </RightColumn>
        </MainGrid>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
