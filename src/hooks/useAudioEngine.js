import { useRef, useEffect } from 'react';

// A simple procedural audio engine using Web Audio API
export const useAudioEngine = (phase, muted = false) => {
  const audioContext = useRef(null);
  const oscillators = useRef([]);
  const gainNode = useRef(null);

  useEffect(() => {
    // Initialize Audio Context on first user interaction (browser policy)
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.current = audioContext.current.createGain();
        gainNode.current.connect(audioContext.current.destination);
        gainNode.current.gain.value = 0.1; // Master volume
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  useEffect(() => {
    if (!audioContext.current) return;

    // Stop old sounds
    oscillators.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    oscillators.current = [];

    if (muted) return;

    const ctx = audioContext.current;
    const now = ctx.currentTime;

    const createOsc = (freq, type = 'sine', vol = 1, fade = 2) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(vol, now + fade);
      
      osc.connect(oscGain);
      oscGain.connect(gainNode.current);
      osc.start();
      
      return { osc, gain: oscGain };
    };

    // Soundscapes per phase
    switch (phase) {
      case 'BIG_BANG':
        // Deep, rising rumble
        const o1 = createOsc(50, 'sawtooth', 0.2);
        o1.osc.frequency.exponentialRampToValueAtTime(200, now + 5);
        // LFO for pulsing
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 10;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain);
        lfoGain.connect(o1.osc.detune);
        lfo.start();
        oscillators.current.push(o1.osc, lfo);
        break;

      case 'QGP':
        // Chaotic white noise-ish (using high freq random modulation)
        const q1 = createOsc(100, 'square', 0.05);
        const q2 = createOsc(150, 'sawtooth', 0.05);
        q1.osc.frequency.linearRampToValueAtTime(800, now + 8); // Rising heat
        q2.osc.detune.setValueAtTime(100, now);
        oscillators.current.push(q1.osc, q2.osc);
        break;

      case 'INFLATION':
        // Whoosh / Drop
        const i1 = createOsc(800, 'sine', 0.2);
        i1.osc.frequency.exponentialRampToValueAtTime(50, now + 4); // Cooling down
        oscillators.current.push(i1.osc);
        break;

      case 'GALAXY':
        // Ethereal Major Chord
        const g1 = createOsc(110.00, 'sine', 0.1); // A2
        const g2 = createOsc(164.81, 'sine', 0.1); // E3
        const g3 = createOsc(196.00, 'sine', 0.1); // G3
        // Slight detune for spacey feel
        g1.osc.detune.value = Math.random() * 10;
        g2.osc.detune.value = Math.random() * 10;
        oscillators.current.push(g1.osc, g2.osc, g3.osc);
        break;

      case 'SOLAR_SYSTEM':
        // Warm, steady drone
        const s1 = createOsc(130.81, 'triangle', 0.05); // C3
        const s2 = createOsc(196.00, 'sine', 0.1); // G3
        oscillators.current.push(s1.osc, s2.osc);
        break;
        
      default:
        break;
    }

  }, [phase, muted]);

  return { 
    toggleMute: () => {
      if (gainNode.current) {
        gainNode.current.gain.setTargetAtTime(muted ? 0.1 : 0, audioContext.current.currentTime, 0.1);
      }
    }
  };
};
