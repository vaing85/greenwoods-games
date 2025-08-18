import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './FishHunter.css';

const FishHunter = ({ socket }) => {
  const [balance, setBalance] = useState(10000);
  const [ammo, setAmmo] = useState(50);
  const [score, setScore] = useState(0);
  const [fishCaught, setFishCaught] = useState(0);
  const [autoFishActive, setAutoFishActive] = useState(false);
  const oceanRef = useRef(null);
  const fishSpawnIntervalRef = useRef(null);
  const autoFishIntervalRef = useRef(null);

  const fishTypes = useMemo(() => [
    { emoji: '🐠', size: 'small', points: 10, prob: 0.4, speed: 8000 },
    { emoji: '🐟', size: 'small', points: 15, prob: 0.3, speed: 8000 },
    { emoji: '🐡', size: 'medium', points: 25, prob: 0.15, speed: 12000 },
    { emoji: '🦈', size: 'large', points: 50, prob: 0.1, speed: 15000 },
    { emoji: '🐋', size: 'boss', points: 200, prob: 0.05, speed: 20000 }
  ], []);

  const catchFish = useCallback((event, points) => {
    event.stopPropagation();

    setScore(prev => prev + points);
    setFishCaught(prev => prev + 1);
    setBalance(prev => prev + points * 2);

    // Remove fish
    event.target.remove();

    // Emit to server
    if (socket) {
      socket.emit('fishCaught', { points, earnings: points * 2 });
    }
  }, [socket]);

  const spawnFish = useCallback(() => {
    if (!oceanRef.current) return;

    const fish = document.createElement('div');
    const rand = Math.random();
    let cumulative = 0;
    let selectedFish = fishTypes[0];

    for (let fishType of fishTypes) {
      cumulative += fishType.prob;
      if (rand <= cumulative) {
        selectedFish = fishType;
        break;
      }
    }

    fish.className = `fish ${selectedFish.size}`;
    fish.textContent = selectedFish.emoji;
    fish.dataset.points = selectedFish.points;
    fish.onclick = (e) => catchFish(e, selectedFish.points);

    oceanRef.current.appendChild(fish);

    setTimeout(() => {
      if (fish.parentNode) fish.parentNode.removeChild(fish);
    }, selectedFish.speed);
  }, [catchFish, fishTypes]);

  const stopFishSpawning = useCallback(() => {
    if (fishSpawnIntervalRef.current) {
      clearInterval(fishSpawnIntervalRef.current);
      fishSpawnIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startSpawning = () => {
      if (fishSpawnIntervalRef.current) clearInterval(fishSpawnIntervalRef.current);
      fishSpawnIntervalRef.current = setInterval(spawnFish, 2000);
    };
    
    startSpawning();
    return () => {
      stopFishSpawning();
      if (autoFishIntervalRef.current) {
        clearInterval(autoFishIntervalRef.current);
      }
    };
  }, [spawnFish, stopFishSpawning]);

  const shootFish = (event) => {
    if (ammo <= 0) {
      alert('No ammo! Buy more to continue.');
      return;
    }

    const ocean = oceanRef.current;
    const rect = ocean.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Create bullet effect
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = x + 'px';
    bullet.style.bottom = '80px';
    ocean.appendChild(bullet);

    setAmmo(prev => prev - 1);

    setTimeout(() => {
      if (bullet.parentNode) bullet.parentNode.removeChild(bullet);
    }, 1000);
  };

  const buyAmmo = () => {
    if (balance < 100) {
      alert('Insufficient balance!');
      return;
    }

    setBalance(prev => prev - 100);
    setAmmo(prev => prev + 25);
  };

  const toggleAutoFish = () => {
    if (autoFishActive) {
      clearInterval(autoFishIntervalRef.current);
      setAutoFishActive(false);
    } else {
      if (balance < 500) {
        alert('Need $500 for auto fish!');
        return;
      }

      setBalance(prev => prev - 500);
      setAmmo(prev => prev + 100);
      setAutoFishActive(true);

      autoFishIntervalRef.current = setInterval(() => {
        const fishes = document.querySelectorAll('.fish');
        if (fishes.length > 0 && ammo > 0) {
          const randomFish = fishes[Math.floor(Math.random() * fishes.length)];
          const points = parseInt(randomFish.dataset.points);
          catchFish({ target: randomFish, stopPropagation: () => {} }, points);
          setAmmo(prev => prev - 1);
        }
      }, 500);

      setTimeout(() => {
        clearInterval(autoFishIntervalRef.current);
        setAutoFishActive(false);
      }, 30000);
    }
  };

  return (
    <div className="fish-hunter-container">
      <div className="game-header">
        <h2>🐠 Fish Hunter</h2>
        <div className="game-stats">
          <div className="stat-item">
            <span>Balance: ${balance.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span>Score: {score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span>Fish Caught: {fishCaught}</span>
          </div>
          <div className="stat-item">
            <span>Ammo: {ammo}</span>
          </div>
        </div>
      </div>

      <div className="ocean-container" ref={oceanRef} onClick={shootFish}>
        <div className="cannon">🔫</div>
      </div>

      <div className="game-controls">
        <button className="btn btn-primary" onClick={buyAmmo}>
          Buy Ammo ($100)
        </button>
        <button 
          className={`btn ${autoFishActive ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleAutoFish}
        >
          {autoFishActive ? 'Stop Auto Fish' : 'Auto Fish ($500)'}
        </button>
      </div>
    </div>
  );
};

export default FishHunter;
