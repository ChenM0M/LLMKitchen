

import { PrepMethod, HeatMethod, MixMethod, MarinateMethod, AnyCookingMethod } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  // Changed to an array to track multiple sources (e.g. noise + motor for blender)
  private activeSources: AudioScheduledSourceNode[] = [];
  private cookingGain: GainNode | null = null;
  private chopInterval: number | null = null;
  private volume: number = 0.3; // Default volume

  // Initialize Audio Context (Must be called on user interaction)
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume; // Use stored volume
      this.masterGain.connect(this.ctx.destination);
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      // Smoothly transition volume to avoid pops
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
    }
  }

  getVolume(): number {
    return this.volume;
  }

  private createOscillator(
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number,
    vol: number = 1
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // --- UI Sounds ---

  playPop() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Bubble pop sound (Sine sweep down)
    this.createOscillator('sine', 800, t, 0.1);
    if (this.ctx && this.masterGain) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  playClick() {
    if (!this.ctx) return;
    // High pitched tick
    this.createOscillator('triangle', 1200, this.ctx.currentTime, 0.05, 0.2);
  }

  playDelete() {
    if (!this.ctx) return;
    // Lower pitched cancel sound
    this.createOscillator('sine', 150, this.ctx.currentTime, 0.15, 0.5);
  }

  // --- Cooking Loops ---

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startCookingSound(method: AnyCookingMethod) {
    this.init();
    this.stopCookingSound(); // Stop any existing sounds first to be safe

    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Special cases: Rhythmic sounds
    if (method === PrepMethod.CHOP) {
      this.playChopSound();
      this.chopInterval = window.setInterval(() => this.playChopSound(), 300);
      return;
    }
    if (method === PrepMethod.SLICE) {
      this.playSliceSound();
      this.chopInterval = window.setInterval(() => this.playSliceSound(), 800); // Slower
      return;
    }
    if (method === PrepMethod.JULIENNE) {
      this.playSliceSound(1.5);
      this.chopInterval = window.setInterval(() => this.playSliceSound(1.5), 200); // Fast
      return;
    }
    if (method === PrepMethod.MASH) {
      this.playMashSound();
      this.chopInterval = window.setInterval(() => this.playMashSound(), 700);
      return;
    }
    if (method === MixMethod.SHAKE) {
      this.playShakeSound();
      this.chopInterval = window.setInterval(() => this.playShakeSound(), 250);
      return;
    }
    if (method === MixMethod.STIR) {
      this.playStirSound();
      this.chopInterval = window.setInterval(() => this.playStirSound(), 400);
      return;
    }

    // Create main noise source for continuous sounds
    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Add to active sources tracking
    this.activeSources.push(source);

    // Create Filter based on method
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    switch (method) {
      case HeatMethod.FRY:
      case HeatMethod.STIR_FRY:
        filter.type = 'highpass';
        filter.frequency.value = 1000; // Sizzle
        gain.gain.value = 0.8;
        break;
      case HeatMethod.DEEP_FRY:
        filter.type = 'highpass';
        filter.frequency.value = 800; // Deeper sizzle
        gain.gain.value = 1.0;
        break;
      case HeatMethod.BOIL:
      case HeatMethod.BRAISE:
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Rumble
        gain.gain.value = 1.0;
        break;
      case HeatMethod.STEAM:
        filter.type = 'bandpass';
        filter.frequency.value = 600; // Hissing steam
        filter.Q.value = 1.0;
        gain.gain.value = 0.7;
        break;
      case HeatMethod.BAKE:
      case HeatMethod.GRILL:
        filter.type = 'lowpass';
        filter.frequency.value = 150; // Low hum
        gain.gain.value = 0.6;
        break;
      case HeatMethod.MICROWAVE:
        // Microwave hum sound
        const microwave = this.ctx.createOscillator();
        microwave.type = 'sine';
        microwave.frequency.value = 60; // 60Hz hum
        const mwGain = this.ctx.createGain();
        mwGain.gain.value = 0.2;
        microwave.connect(mwGain);
        mwGain.connect(this.masterGain);
        microwave.start(t);
        this.activeSources.push(microwave);
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        gain.gain.value = 0.3;
        break;
      case PrepMethod.BLEND:
      case PrepMethod.GRIND:
        // Use an oscillator for motor sound + noise
        const motor = this.ctx.createOscillator();
        motor.type = 'sawtooth';
        motor.frequency.value = 200;
        const motorGain = this.ctx.createGain();
        motorGain.gain.value = 0.15; // Quieter motor per feedback
        motor.connect(motorGain);
        motorGain.connect(this.masterGain);
        motor.start(t);
        this.activeSources.push(motor);

        filter.type = 'bandpass';
        filter.frequency.value = 800;
        gain.gain.value = 0.5;
        break;
      case PrepMethod.AIR_DRY:
        filter.type = 'bandpass';
        filter.frequency.value = 400; // Wind-like
        filter.Q.value = 0.5;
        gain.gain.value = 0.4;

        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.5;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(t);
        this.activeSources.push(lfo);
        break;
      case PrepMethod.DEHYDRATE:
        filter.type = 'lowpass';
        filter.frequency.value = 200; // Low hum/heat
        gain.gain.value = 0.3;
        break;
      case MarinateMethod.MARINATE:
        filter.type = 'lowpass';
        filter.frequency.value = 300; // Liquid-like
        gain.gain.value = 0.15; // Much quieter as requested
        break;
      case MixMethod.BUILD:
        // Just a pour sound, maybe use low pass noise
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        gain.gain.value = 0.5;
        break;
      default:
        filter.type = 'allpass';
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Fade in
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gain.gain.value, t + 0.5);

    source.start(t);
    this.cookingGain = gain;
  }

  // --- One-Shot Prep Sounds ---

  playPrep(method: PrepMethod) {
    if (!this.ctx || !this.masterGain) this.init(); // Ensure init
    if (!this.ctx) return;

    switch (method) {
      case PrepMethod.CHOP:
        this.playChopSound();
        break;
      case PrepMethod.SLICE:
        this.playSliceSound();
        break;
      case PrepMethod.JULIENNE:
        this.playSliceSound(1.5); // Higher pitch for Julienne
        break;
      case PrepMethod.MASH:
        this.playMashSound();
        break;
      case PrepMethod.GRIND:
      case PrepMethod.BLEND:
        // These might be loops, but if used as instantaneous actions:
        this.playMotorBurst();
        break;
      case PrepMethod.AIR_DRY:
        this.playAirBurst();
        break;
      case PrepMethod.DEHYDRATE:
        this.playMotorBurst(); // Use motor/hum for dehydrate
        break;
      default:
        this.playChopSound();
    }
  }

  private playSliceSound(pitchMultiplier: number = 1) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer();
    if (!noise) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noise;
    // Filter for "Schwing" / "Shhh" sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800 * pitchMultiplier, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(t);
  }

  private playMashSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Low frequency squash
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
  }

  private playMotorBurst() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
  }

  private playAirBurst() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
  }

  // existing playChopSound...
  private playChopSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Wood block thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  private playShakeSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // High pitch noise burst (Ice hitting metal)
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(t);
  }

  private playStirSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // High pitch sine ping (Glass)
    this.createOscillator('sine', 2000 + Math.random() * 500, t, 0.05, 0.1);
  }

  stopCookingSound() {
    if (this.chopInterval) {
      clearInterval(this.chopInterval);
      this.chopInterval = null;
    }

    if (this.activeSources.length > 0) {
      const sourcesToStop = [...this.activeSources];
      this.activeSources = [];

      if (this.cookingGain && this.ctx) {
        const t = this.ctx.currentTime;
        try {
          this.cookingGain.gain.cancelScheduledValues(t);
          this.cookingGain.gain.setValueAtTime(this.cookingGain.gain.value, t);
          this.cookingGain.gain.linearRampToValueAtTime(0, t + 0.2);
        } catch (e) { }

        setTimeout(() => {
          sourcesToStop.forEach(src => {
            try { src.stop(); } catch (e) { }
          });
        }, 250);
      } else {
        sourcesToStop.forEach(src => {
          try { src.stop(); } catch (e) { }
        });
      }
      this.cookingGain = null;
    }
  }

  // ... Result sounds same as before
  playWin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.createOscillator('triangle', 523.25, t, 0.2); // C5
    this.createOscillator('triangle', 659.25, t + 0.1, 0.2); // E5
    this.createOscillator('triangle', 783.99, t + 0.2, 0.2); // G5
    this.createOscillator('triangle', 1046.50, t + 0.3, 0.4); // C6
  }

  playSuccess() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.createOscillator('sine', 440, t, 0.2);
    this.createOscillator('sine', 554, t + 0.1, 0.4);
  }

  playFailure() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.8);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.8);
  }
}

export const audioService = new AudioService();