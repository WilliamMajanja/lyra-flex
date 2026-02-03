
import React from 'react';
import { Zap, Activity, ShieldCheck, Coins, Server } from 'lucide-react';
import { NodeType, DrumTrack, Clip } from './types';

export const CLUSTER_CONFIG = {
  core: {
    name: "LyraFlex Core (FX-Core)",
    icon: <Server className="w-5 h-5 text-emerald-400" />,
    role: "Integrated Performance Engine",
    os: "RPi OS Lite (RT)",
    specs: "RPi 5 16GB | Hailo-8+",
    color: "emerald"
  },
  nebula: {
    name: "Nebula Synth (FX-01)",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    role: "Neural Synth (RAVE)",
    os: "RPi OS Lite (RT)",
    specs: "RPi 5 16GB | Hailo-8+",
    color: "cyan"
  },
  pulse: {
    name: "Pulse Rhythm (FX-02)",
    icon: <Activity className="w-5 h-5 text-fuchsia-500" />,
    role: "Neural Rhythm (Groove)",
    os: "RPi OS Lite (RT)",
    specs: "RPi 5 16GB | Hailo-8+",
    color: "fuchsia"
  },
  brain: {
    name: "Master Brain (FX-03)",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    role: "Master Mixer & TX",
    os: "RPi OS Lite (RT)",
    specs: "RPi 5 16GB | Sense HAT",
    color: "emerald"
  }
};

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const SCALES: ('Major' | 'Minor')[] = ['Major', 'Minor'];
export const TIME_SIGNATURES = [
    { beats: 4, subdivision: 4 },
    { beats: 3, subdivision: 4 },
    { beats: 6, subdivision: 8 },
    { beats: 5, subdivision: 4 },
];

const createInitialClip = (
  steps: boolean[], 
  velocities?: number[], 
  probabilities?: number[], 
  pitches?: number[],
  timeSignature = { beats: 4, subdivision: 4 }
): Clip => {
  const length = 16; // Standardized for this UI
  const fill = <T,>(arr: T[] | undefined, val: T) => (arr || Array(length).fill(val)).slice(0, length);
  
  return {
    id: `clip_${Math.random().toString(36).substring(2, 9)}`,
    steps: fill(steps, false),
    velocities: fill(velocities, 0.8),
    probabilities: fill(probabilities, 1.0),
    pitches: fill(pitches, 12),
    length: length,
    timeSignature: timeSignature
  };
};

export const INITIAL_DRUM_TRACKS: DrumTrack[] = [
  { 
    id: 'bd', name: 'Kick_808', color: 'emerald', npuMod: 0.1, mute: false, solo: false, volume: 0.8, frequency: 0.2,
    engine: 'LMMS', activeClipIndex: 0,
    clips: [createInitialClip(Array(16).fill(false).map((_, i) => i % 4 === 0))]
  },
  { 
    id: 'sn', name: 'Snare_DX', color: 'fuchsia', npuMod: 0.3, mute: false, solo: false, volume: 0.7, frequency: 0.5,
    engine: 'LMMS', activeClipIndex: 0,
    clips: [createInitialClip(Array(16).fill(false).map((_, i) => i === 4 || i === 12))]
  },
  { 
    id: 'hh', name: 'Closed_Hat', color: 'cyan', npuMod: 0.8, mute: false, solo: false, volume: 0.5, frequency: 0.8,
    engine: 'Mixxx', activeClipIndex: 0,
    clips: [createInitialClip(Array(16).fill(false).map((_, i) => i % 2 === 0))]
  },
  { 
    id: 'bs', name: 'Sub_Bass', color: 'red', npuMod: 0.3, mute: false, solo: false, volume: 0.7, frequency: 0.3,
    engine: 'ZynAddSubFX', activeClipIndex: 0,
    clips: [createInitialClip(
      [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false],
      Array(16).fill(0.9),
      Array(16).fill(1.0),
      [0, 12, 12, 12, 12, 12, 5, 12, 7, 12, 12, 12, 12, 12, 12, 12]
    )]
  },
  { 
    id: 'ld', name: 'Poly_Lead', color: 'violet', npuMod: 0.7, mute: false, solo: false, volume: 0.5, frequency: 0.6,
    engine: 'ZynAddSubFX', activeClipIndex: 0,
    clips: [createInitialClip(Array(16).fill(false), Array(16).fill(0.6))]
  },
];
