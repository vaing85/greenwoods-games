// Sound effects for casino games
export class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 0.5;
    this.enabled = true;
    this.initializeSounds();
  }

  initializeSounds() {
    // Create audio context for web audio
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Define sound frequencies and patterns
    this.soundDefinitions = {
      spin: { frequency: 200, duration: 1000, type: 'sweep' },
      win: { frequency: 600, duration: 500, type: 'chord' },
      lose: { frequency: 150, duration: 300, type: 'descend' },
      jackpot: { frequency: 800, duration: 2000, type: 'celebration' },
      click: { frequency: 400, duration: 100, type: 'beep' },
      cardFlip: { frequency: 300, duration: 200, type: 'flip' },
      chipPlace: { frequency: 250, duration: 150, type: 'clink' },
      backgroundMusic: { type: 'ambient' }
    };
  }

  playSound(soundName, options = {}) {
    if (!this.enabled || !this.audioContext) return;

    const soundDef = this.soundDefinitions[soundName];
    if (!soundDef) return;

    switch (soundDef.type) {
      case 'sweep':
        this.playSweepSound(soundDef.frequency, soundDef.duration);
        break;
      case 'chord':
        this.playChordSound(soundDef.frequency, soundDef.duration);
        break;
      case 'descend':
        this.playDescendSound(soundDef.frequency, soundDef.duration);
        break;
      case 'celebration':
        this.playCelebrationSound();
        break;
      case 'beep':
        this.playBeepSound(soundDef.frequency, soundDef.duration);
        break;
      case 'flip':
        this.playFlipSound();
        break;
      case 'clink':
        this.playClinkSound();
        break;
      default:
        this.playBeepSound(soundDef.frequency, soundDef.duration);
    }
  }

  playSweepSound(startFreq, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(startFreq * 2, this.audioContext.currentTime + duration / 1000);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playChordSound(baseFreq, duration) {
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime + index * 0.1);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    });
  }

  playDescendSound(startFreq, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(startFreq * 0.5, this.audioContext.currentTime + duration / 1000);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playCelebrationSound() {
    // Multi-layered celebration sound
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playChordSound(400 + i * 100, 300);
      }, i * 200);
    }
  }

  playBeepSound(frequency, duration) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playFlipSound() {
    // Quick frequency sweep for card flip
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playClinkSound() {
    // Metallic clink for chips
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Initialize audio context on user interaction (required by browsers)
  async initializeOnUserGesture() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export const soundManager = new SoundManager();
