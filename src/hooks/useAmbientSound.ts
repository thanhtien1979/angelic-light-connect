import { useState, useRef, useCallback, useEffect } from "react";

export type AmbientSoundType = "silence" | "singing-bowl" | "wind" | "water" | "forest";

interface AmbientSoundOption {
  id: AmbientSoundType;
  name: string;
  nameVi: string;
  icon: string;
}

export const AMBIENT_SOUNDS: AmbientSoundOption[] = [
  { id: "silence", name: "Silence", nameVi: "Tĩnh lặng", icon: "🤫" },
  { id: "singing-bowl", name: "Singing Bowl", nameVi: "Chuông bát", icon: "🔔" },
  { id: "wind", name: "Wind", nameVi: "Gió", icon: "🌬️" },
  { id: "water", name: "Water", nameVi: "Nước", icon: "💧" },
  { id: "forest", name: "Forest", nameVi: "Rừng", icon: "🌿" },
];

const STORAGE_KEY = "meditation-ambient-sound";
const VOLUME_KEY = "meditation-ambient-volume";

export const useAmbientSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as AmbientSoundType) || "silence";
  });
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.3; // Soft default volume
  });

  // Save preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedSound);
  }, [selectedSound]);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, volume.toString());
  }, [volume]);

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current?.currentTime || 0);
    }
  }, [volume]);

  const createNoiseBuffer = (context: AudioContext, type: "white" | "pink" | "brown"): AudioBuffer => {
    const bufferSize = context.sampleRate * 10; // 10 seconds of noise
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else { // brown
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    
    return buffer;
  };

  const stopSound = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];

    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      noiseNodeRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  const playSound = useCallback((soundType: AmbientSoundType) => {
    stopSound();
    
    if (soundType === "silence") {
      return;
    }

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const gainNode = context.createGain();
      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.connect(context.destination);
      gainNodeRef.current = gainNode;

      switch (soundType) {
        case "singing-bowl":
          // Create singing bowl harmonics
          const bowlFrequencies = [174, 285, 396, 528];
          bowlFrequencies.forEach((freq, index) => {
            const osc = context.createOscillator();
            const oscGain = context.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, context.currentTime);
            oscGain.gain.setValueAtTime(0.15 / (index + 1), context.currentTime);
            
            // Gentle pulsing
            const lfo = context.createOscillator();
            const lfoGain = context.createGain();
            lfo.frequency.setValueAtTime(0.1 + index * 0.05, context.currentTime);
            lfoGain.gain.setValueAtTime(0.02, context.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);
            lfo.start();
            
            osc.connect(oscGain);
            oscGain.connect(gainNode);
            osc.start();
            oscillatorsRef.current.push(osc);
          });
          break;

        case "wind":
          // Wind-like brown noise with modulation
          const windBuffer = createNoiseBuffer(context, "brown");
          const windSource = context.createBufferSource();
          windSource.buffer = windBuffer;
          windSource.loop = true;
          
          const windFilter = context.createBiquadFilter();
          windFilter.type = "lowpass";
          windFilter.frequency.setValueAtTime(400, context.currentTime);
          
          // Modulate filter for wind gusts
          const windLfo = context.createOscillator();
          const windLfoGain = context.createGain();
          windLfo.frequency.setValueAtTime(0.15, context.currentTime);
          windLfoGain.gain.setValueAtTime(200, context.currentTime);
          windLfo.connect(windLfoGain);
          windLfoGain.connect(windFilter.frequency);
          windLfo.start();
          
          windSource.connect(windFilter);
          windFilter.connect(gainNode);
          windSource.start();
          noiseNodeRef.current = windSource;
          break;

        case "water":
          // Gentle water-like pink noise
          const waterBuffer = createNoiseBuffer(context, "pink");
          const waterSource = context.createBufferSource();
          waterSource.buffer = waterBuffer;
          waterSource.loop = true;
          
          const waterFilter = context.createBiquadFilter();
          waterFilter.type = "bandpass";
          waterFilter.frequency.setValueAtTime(1000, context.currentTime);
          waterFilter.Q.setValueAtTime(0.5, context.currentTime);
          
          // Bubbling effect
          const waterLfo = context.createOscillator();
          const waterLfoGain = context.createGain();
          waterLfo.frequency.setValueAtTime(0.5, context.currentTime);
          waterLfoGain.gain.setValueAtTime(300, context.currentTime);
          waterLfo.connect(waterLfoGain);
          waterLfoGain.connect(waterFilter.frequency);
          waterLfo.start();
          
          waterSource.connect(waterFilter);
          waterFilter.connect(gainNode);
          waterSource.start();
          noiseNodeRef.current = waterSource;
          break;

        case "forest":
          // Forest ambiance - layered soft sounds
          const forestBuffer = createNoiseBuffer(context, "pink");
          const forestSource = context.createBufferSource();
          forestSource.buffer = forestBuffer;
          forestSource.loop = true;
          
          const forestFilter = context.createBiquadFilter();
          forestFilter.type = "highpass";
          forestFilter.frequency.setValueAtTime(2000, context.currentTime);
          
          const forestGain = context.createGain();
          forestGain.gain.setValueAtTime(0.3, context.currentTime);
          
          forestSource.connect(forestFilter);
          forestFilter.connect(forestGain);
          forestGain.connect(gainNode);
          forestSource.start();
          noiseNodeRef.current = forestSource;
          
          // Add subtle bird-like tones
          [2000, 2500, 3000].forEach((freq, i) => {
            const birdOsc = context.createOscillator();
            const birdGain = context.createGain();
            birdOsc.type = "sine";
            birdOsc.frequency.setValueAtTime(freq, context.currentTime);
            birdGain.gain.setValueAtTime(0.02, context.currentTime);
            
            // Random chirping
            const chirpLfo = context.createOscillator();
            const chirpGain = context.createGain();
            chirpLfo.frequency.setValueAtTime(0.2 + i * 0.1, context.currentTime);
            chirpGain.gain.setValueAtTime(0.015, context.currentTime);
            chirpLfo.connect(chirpGain);
            chirpGain.connect(birdGain.gain);
            chirpLfo.start();
            
            birdOsc.connect(birdGain);
            birdGain.connect(gainNode);
            birdOsc.start();
            oscillatorsRef.current.push(birdOsc);
          });
          break;
      }

      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing ambient sound:", error);
    }
  }, [volume, stopSound]);

  const toggleSound = useCallback(() => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound(selectedSound);
    }
  }, [isPlaying, selectedSound, playSound, stopSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSound]);

  return {
    isPlaying,
    selectedSound,
    setSelectedSound,
    volume,
    setVolume,
    playSound,
    stopSound,
    toggleSound,
    ambientSounds: AMBIENT_SOUNDS,
  };
};
