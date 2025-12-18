import { useCallback, useRef } from "react";

// Gentle chime sound using Web Audio API
export const useLightSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playLightChime = useCallback(() => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // Create a gentle, spiritual chime sound
      const playNote = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Gentle attack and release for ethereal feel
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Celestial chord progression (C major 7 arpeggio - spiritual feel)
      const notes = [
        { freq: 523.25, delay: 0, duration: 1.5, vol: 0.15 },     // C5
        { freq: 659.25, delay: 0.15, duration: 1.3, vol: 0.12 },  // E5
        { freq: 783.99, delay: 0.3, duration: 1.1, vol: 0.10 },   // G5
        { freq: 987.77, delay: 0.45, duration: 0.9, vol: 0.08 },  // B5
        { freq: 1046.50, delay: 0.6, duration: 0.7, vol: 0.06 },  // C6 (octave higher)
      ];

      notes.forEach(note => {
        playNote(note.freq, now + note.delay, note.duration, note.vol);
      });

    } catch (error) {
      // Silently fail if audio not supported
      console.log("Light sound unavailable:", error);
    }
  }, []);

  return { playLightChime };
};
