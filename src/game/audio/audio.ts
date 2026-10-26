/**
 * Basic game audio, synthesized at runtime with the Web Audio API.
 * Every sound is generated in code (oscillators, envelopes, filtered noise),
 * so there are no audio files to license.
 *
 * Browsers only allow audio after a user gesture, so the AudioContext is
 * created lazily on the first key press or click. All calls are safe no-ops
 * before that, and in environments without Web Audio (tests).
 */

export type SfxName =
  | 'select' // menu cursor move
  | 'confirm' // menu confirm
  | 'text' // dialogue line advance
  | 'door' // scene transition
  | 'objective' // new objective
  | 'awaken' // heirloom flare
  | 'hit' // player attack lands
  | 'radiant' // Radiant Strike
  | 'guard' // Defend
  | 'enemy_hit' // Guardian hits Adrian
  | 'victory'
  | 'defeat'
  | 'save';

export type AmbienceName = 'title' | 'village' | 'home' | 'chamber' | 'battle' | 'ending' | 'waterfront';

type Ctx = AudioContext;

class AudioEngine {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private volume = 0.7;
  private muted = false;
  private ambience: { name: AmbienceName; stop: () => void } | null = null;
  private wantedAmbience: AmbienceName | null = null;

  /** Creates/resumes the AudioContext. Call from a user-gesture handler. */
  unlock() {
    if (typeof window === 'undefined') return;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      try {
        this.ctx = new AC();
      } catch {
        return;
      }
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
      this.noise = this.makeNoise(this.ctx);
      if (this.wantedAmbience) this.setAmbience(this.wantedAmbience);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setVolume(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    this.applyVolume();
  }

  private applyVolume() {
    if (!this.ctx || !this.master) return;
    const v = this.muted ? 0 : this.volume * 0.6;
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  private makeNoise(ctx: Ctx): AudioBuffer {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** A single enveloped tone. */
  private tone(
    freq: number,
    start: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; to?: number; attack?: number; dest?: AudioNode } = {},
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
    const peak = opts.gain ?? 0.2;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + (opts.attack ?? 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(opts.dest ?? this.master!);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  /** A burst of filtered noise. */
  private burst(start: number, dur: number, opts: { freq?: number; q?: number; gain?: number; type?: BiquadFilterType } = {}) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'lowpass';
    f.frequency.value = opts.freq ?? 800;
    f.Q.value = opts.q ?? 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain ?? 0.3, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(start);
    src.stop(start + dur + 0.05);
  }

  play(name: SfxName) {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case 'select':
        this.tone(880, t, 0.06, { type: 'square', gain: 0.05 });
        break;
      case 'confirm':
        this.tone(660, t, 0.07, { type: 'square', gain: 0.06 });
        this.tone(990, t + 0.06, 0.1, { type: 'square', gain: 0.06 });
        break;
      case 'text':
        this.tone(1250, t, 0.03, { type: 'triangle', gain: 0.04 });
        break;
      case 'door':
        this.burst(t, 0.45, { freq: 500, gain: 0.25 });
        this.tone(140, t, 0.4, { to: 90, gain: 0.12 });
        break;
      case 'objective':
        [784, 988, 1175].forEach((f, i) => this.tone(f, t + i * 0.09, 0.35, { type: 'triangle', gain: 0.07 }));
        break;
      case 'awaken':
        [523, 659, 784, 1047, 1319].forEach((f, i) =>
          this.tone(f, t + i * 0.12, 1.6, { type: 'sine', gain: 0.1, attack: 0.05 }),
        );
        this.burst(t, 1.2, { freq: 4000, type: 'highpass', gain: 0.06 });
        break;
      case 'hit':
        this.burst(t + 0.2, 0.15, { freq: 1500, gain: 0.35 });
        this.tone(220, t + 0.2, 0.15, { type: 'square', to: 110, gain: 0.12 });
        break;
      case 'radiant':
        this.tone(300, t, 0.3, { type: 'sawtooth', to: 1200, gain: 0.08 });
        [1047, 1319, 1568].forEach((f, i) => this.tone(f, t + 0.2 + i * 0.05, 0.6, { gain: 0.1 }));
        this.burst(t + 0.2, 0.4, { freq: 3000, type: 'highpass', gain: 0.15 });
        break;
      case 'guard':
        this.tone(440, t, 0.25, { type: 'triangle', gain: 0.1 });
        this.tone(660, t + 0.05, 0.3, { type: 'sine', gain: 0.08 });
        break;
      case 'enemy_hit':
        this.tone(90, t + 0.2, 0.3, { to: 45, gain: 0.35 });
        this.burst(t + 0.2, 0.25, { freq: 400, gain: 0.4 });
        break;
      case 'victory':
        [523, 659, 784, 1047].forEach((f, i) =>
          this.tone(f, t + i * 0.14, i === 3 ? 0.9 : 0.2, { type: 'triangle', gain: 0.12 }),
        );
        break;
      case 'defeat':
        [392, 349, 311, 262].forEach((f, i) => this.tone(f, t + i * 0.22, 0.4, { type: 'triangle', gain: 0.1 }));
        break;
      case 'save':
        this.tone(587, t, 0.12, { type: 'sine', gain: 0.1 });
        this.tone(880, t + 0.1, 0.25, { type: 'sine', gain: 0.1 });
        break;
    }
  }

  /** Switches the looping background layer, crossfading from the previous one. */
  setAmbience(name: AmbienceName | null) {
    this.wantedAmbience = name;
    if (!this.ctx || !this.master) return;
    if (this.ambience?.name === name) return;
    this.ambience?.stop();
    this.ambience = name ? { name, stop: this.startAmbience(name) } : null;
  }

  private startAmbience(name: AmbienceName): () => void {
    const ctx = this.ctx!;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.5);
    bus.connect(this.master!);
    const nodes: AudioScheduledSourceNode[] = [];
    const timers: number[] = [];

    const pad = (freqs: number[], gain: number, type: OscillatorType = 'sine') => {
      for (const f of freqs) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07 + Math.random() * 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = f * 0.004; // gentle detune drift
        lfo.connect(lfoGain).connect(o.frequency);
        const g = ctx.createGain();
        g.gain.value = gain;
        o.connect(g).connect(bus);
        o.start();
        lfo.start();
        nodes.push(o, lfo);
      }
    };
    const wash = (freq: number, gain: number) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = gain * 0.4;
      lfo.connect(lfoGain).connect(g.gain);
      src.connect(f).connect(g).connect(bus);
      src.start();
      lfo.start();
      nodes.push(src, lfo);
    };
    const every = (minMs: number, maxMs: number, fn: () => void) => {
      const loop = () => {
        fn();
        timers.push(window.setTimeout(loop, minMs + Math.random() * (maxMs - minMs)));
      };
      timers.push(window.setTimeout(loop, minMs));
    };
    const chirp = () => {
      const t = ctx.currentTime;
      const base = 2200 + Math.random() * 1200;
      for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
        this.tone(base, t + i * 0.11, 0.08, { to: base * 1.3, gain: 0.025, dest: bus });
      }
    };

    switch (name) {
      case 'title':
        pad([110, 164.8, 220, 277.2], 0.035);
        wash(500, 0.05);
        break;
      case 'village':
        wash(650, 0.12); // the river
        pad([196, 293.7], 0.02);
        every(3000, 7000, chirp);
        break;
      case 'waterfront': {
        // Evening river, a soft city hum and night insects
        wash(550, 0.1);
        pad([174.6, 261.6, 329.6], 0.018);
        every(2500, 6000, () => {
          const t = ctx.currentTime;
          for (let i = 0; i < 6; i++) this.tone(4300, t + i * 0.05, 0.03, { gain: 0.012, dest: bus });
        });
        break;
      }
      case 'home':
        pad([130.8, 196, 246.9], 0.025);
        wash(300, 0.03);
        break;
      case 'chamber':
        pad([55, 82.4, 110], 0.05, 'triangle');
        wash(250, 0.06);
        break;
      case 'battle': {
        pad([55, 82.4], 0.05, 'triangle');
        // Low heartbeat pulse
        every(700, 700, () => {
          const t = ctx.currentTime;
          this.tone(70, t, 0.18, { to: 50, gain: 0.18, dest: bus });
          this.tone(70, t + 0.2, 0.15, { to: 50, gain: 0.1, dest: bus });
        });
        break;
      }
      case 'ending':
        pad([130.8, 196, 261.6, 329.6], 0.04);
        break;
    }

    return () => {
      const t = ctx.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
      bus.gain.exponentialRampToValueAtTime(0.0001, t + 1);
      timers.forEach((id) => clearTimeout(id));
      for (const n of nodes) {
        try {
          n.stop(t + 1.1);
        } catch {
          // already stopped
        }
      }
    };
  }
}

export const audio = new AudioEngine();
