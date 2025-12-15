class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  
  // Music State
  private musicEnabled: boolean = false;
  private bgMusic: HTMLAudioElement; 
  
  // SFX State
  private clickSound: HTMLAudioElement;

  constructor() {
    // URL Musik yang sudah diperbaiki menjadi RAW URL (bukan link blob/halaman github)
    // Link asli user: github.com/.../blob/... -> Diubah ke raw.githubusercontent.com/...
    const musicUrl = 'https://raw.githubusercontent.com/zhuofan2h/gamecatur/4bf046ca97268b0166b59186ba46c426d661981a/v4.www-y2mate.blog%20-%20Demon%20Slayer%20-%20Nakime%20Theme%20EPIC%20FAN%20VERSION%20(%E9%AC%BC%E6%BB%85%E3%81%AE%E5%88%83%20OST)%20(64%20KBps).mp3';
    
    this.bgMusic = new Audio(musicUrl);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.5;
    this.bgMusic.preload = 'auto'; // Pastikan dimuat
    
    this.bgMusic.addEventListener('error', (e) => {
        console.error("Error loading background music:", this.bgMusic.error);
    });

    // Menu Click Sound: "Teng" (Biwa Strum)
    const sfxUrl = 'https://raw.githubusercontent.com/zhuofan2h/gamecatur/4bf046ca97268b0166b59186ba46c426d661981a/teng.mp3';
    this.clickSound = new Audio(sfxUrl);
    this.clickSound.volume = 1.0; 
    this.clickSound.preload = 'auto';
  }

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioContextClass();
    }
    return this.context;
  }

  private async resumeContext() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.error("Failed to resume audio context", e);
      }
    }
  }

  async initializeAudio() {
    this.resumeContext();

    if (this.musicEnabled) {
        try {
            if (this.bgMusic.paused) {
                const playPromise = this.bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Auto-play prevented by browser policy:", error);
                    });
                }
            }
        } catch(e) {
            console.warn("Audio play failed", e);
        }
    }
  }

  toggleSound(enabled: boolean) {
    this.enabled = enabled;
  }

  async toggleMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    this.resumeContext();

    if (this.musicEnabled) {
      try {
        // Reset time if it hasn't started or encountered error
        if (this.bgMusic.error) {
            this.bgMusic.load();
        }
        
        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Music playback prevented. Waiting for interaction.");
            });
        }
      } catch (e) {
        console.warn("Music play blocked or failed.", e);
      }
    } else {
      this.bgMusic.pause();
    }
  }

  getMusicState() {
    return this.musicEnabled;
  }

  playClick() {
    if (!this.enabled) return;
    
    try {
      this.clickSound.currentTime = 0;
      const promise = this.clickSound.play();
      if (promise !== undefined) {
          promise.catch(e => {
              // Fallback if file fails
              this.playClickFallback();
          });
      }
    } catch (e) {
      this.playClickFallback();
    }
  }

  // Fallback sound (Biwa-like pluck) using WebAudio if MP3 fails
  private async playClickFallback() {
      await this.resumeContext();
      const ctx = this.getContext();
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
  }

  // --- Gameplay Sounds (Web Audio API) ---

  async playSelect() {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  async playMove() {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  async playCapture() {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square'; 
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  async playCheck() {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    this.tone(ctx, 880, 0.15, t, 'sine');
    this.tone(ctx, 554.37, 0.3, t, 'sine');
  }

  async playStart() {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;
    
    this.tone(ctx, 523.25, 0.3, t, 'triangle');     
    this.tone(ctx, 659.25, 0.3, t + 0.1, 'triangle'); 
    this.tone(ctx, 783.99, 0.6, t + 0.2, 'triangle'); 
  }

  async playCastle() {
     if (!this.enabled) return;
     await this.resumeContext();
     const ctx = this.getContext();
     const t = ctx.currentTime;
     
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(200, t);
     osc.frequency.linearRampToValueAtTime(400, t + 0.2);
     
     gain.gain.setValueAtTime(0.2, t);
     gain.gain.linearRampToValueAtTime(0, t + 0.2);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start(t);
     osc.stop(t + 0.2);
  }

  async playPromote() {
     this.playStart();
  }

  // --- EPIC FINALE SOUNDS ---

  async playCheckmateSequence(isWhiteWinner: boolean) {
    if (!this.enabled) return;
    await this.resumeContext();
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // 1. THE SLASH
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.value = 1;
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(8000, t + 0.3); 

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.8, t + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // 2. THE IMPACT
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(150, t + 0.1);
    boomOsc.frequency.exponentialRampToValueAtTime(30, t + 1.5); 

    const shaper = ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(400);

    boomGain.gain.setValueAtTime(0, t + 0.1);
    boomGain.gain.linearRampToValueAtTime(1.0, t + 0.15); 
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5); 

    boomOsc.connect(shaper);
    shaper.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(t + 0.1);
    boomOsc.stop(t + 2.5);

    // 3. THE BREATH/ECHO
    const droneOsc = ctx.createOscillator();
    droneOsc.type = isWhiteWinner ? 'sine' : 'sawtooth'; 
    droneOsc.frequency.setValueAtTime(isWhiteWinner ? 392.00 : 73.42, t + 0.5); 
    
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, t + 0.5);
    droneGain.gain.linearRampToValueAtTime(0.2, t + 1.0);
    droneGain.gain.linearRampToValueAtTime(0, t + 4.0);
    
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start(t + 0.5);
    droneOsc.stop(t + 4.0);
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    let x;
    for (let i = 0; i < n_samples; ++i) {
      x = i * 2 / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private tone(
    ctx: AudioContext, 
    freq: number, 
    duration: number, 
    startTime: number, 
    type: OscillatorType = 'sine',
    vol: number = 0.2
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundManager = new SoundManager();