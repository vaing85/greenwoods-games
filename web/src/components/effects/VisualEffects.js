import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Confetti Animation
const confettiFall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const ConfettiPiece = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  animation: ${confettiFall} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  left: ${props => props.left}%;
  border-radius: ${props => props.shape === 'circle' ? '50%' : '0'};
`;

export const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

// Win Animation
const winPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const winGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
`;

export const WinAnimation = styled.div`
  animation: ${winPulse} 0.6s ease-in-out, ${winGlow} 1s ease-in-out infinite;
`;

// Coin Flip Animation
const coinFlip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); }
`;

export const CoinFlipAnimation = styled.div`
  animation: ${coinFlip} 0.6s ease-in-out;
  transform-style: preserve-3d;
`;

// Particle Effects
const particleFloat = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) rotate(360deg);
    opacity: 0;
  }
`;

export const ParticleEffect = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${props => props.color || '#FFD700'};
  border-radius: 50%;
  animation: ${particleFloat} 2s ease-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// Slot Reel Spin Effect
const slotSpin = keyframes`
  0% { transform: translateY(0px); }
  25% { transform: translateY(-20px); }
  50% { transform: translateY(-40px); }
  75% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

export const SlotSpinEffect = styled.div`
  animation: ${props => props.spinning ? css`${slotSpin} 0.1s linear infinite` : 'none'};
`;

// Card Deal Animation
const cardDeal = keyframes`
  0% {
    transform: translateX(-100px) translateY(-50px) rotate(-10deg);
    opacity: 0;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateX(0px) translateY(0px) rotate(0deg);
    opacity: 1;
  }
`;

export const CardDealAnimation = styled.div`
  animation: ${cardDeal} 0.8s ease-out;
`;

// Chip Stack Animation
const chipStack = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0px); opacity: 1; }
`;

export const ChipAnimation = styled.div`
  animation: ${chipStack} 0.3s ease-out;
  animation-delay: ${props => props.delay}s;
  animation-fill-mode: both;
`;

// Jackpot Text Animation
const jackpotFlash = keyframes`
  0%, 100% { 
    color: #FFD700; 
    text-shadow: 0 0 10px #FFD700;
  }
  25% { 
    color: #FF6B6B; 
    text-shadow: 0 0 15px #FF6B6B;
  }
  50% { 
    color: #4ECDC4; 
    text-shadow: 0 0 15px #4ECDC4;
  }
  75% { 
    color: #45B7D1; 
    text-shadow: 0 0 15px #45B7D1;
  }
`;

export const JackpotText = styled.div`
  animation: ${jackpotFlash} 2s ease-in-out infinite;
  font-weight: bold;
  font-size: 2rem;
`;

// Confetti Component
export const Confetti = ({ show, duration = 3 }) => {
  if (!show) return null;

  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const confettiPieces = [];

  for (let i = 0; i < 50; i++) {
    confettiPieces.push(
      <ConfettiPiece
        key={i}
        color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
        left={Math.random() * 100}
        delay={Math.random() * 2}
        duration={duration + Math.random() * 2}
        shape={Math.random() > 0.5 ? 'circle' : 'square'}
      />
    );
  }

  return <ConfettiContainer>{confettiPieces}</ConfettiContainer>;
};

// Particle Burst Component
export const ParticleBurst = ({ show, x = 50, y = 50, count = 10 }) => {
  if (!show) return null;

  const particles = [];
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  for (let i = 0; i < count; i++) {
    particles.push(
      <ParticleEffect
        key={i}
        color={colors[Math.floor(Math.random() * colors.length)]}
        delay={Math.random() * 0.5}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 50}px)`
        }}
      />
    );
  }

  return <div style={{ position: 'relative' }}>{particles}</div>;
};

// Floating Numbers (for wins/losses)
const floatUp = keyframes`
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(-80px);
    opacity: 0;
  }
`;

export const FloatingNumber = styled.div`
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.positive ? '#4CAF50' : '#F44336'};
  animation: ${floatUp} 2s ease-out;
  pointer-events: none;
  z-index: 100;
`;

// Glow Effect
export const GlowEffect = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #45B7D1);
    border-radius: inherit;
    z-index: -1;
    animation: ${winGlow} 2s ease-in-out infinite;
    opacity: ${props => props.active ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

// Button Press Effect
const buttonPress = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

export const ButtonPressEffect = styled.div`
  animation: ${props => props.pressed ? css`${buttonPress} 0.1s ease-out` : 'none'};
`;

// Typewriter Effect for Text
export const TypewriterText = ({ text, speed = 100, onComplete }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayText}</span>;
};
