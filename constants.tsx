
import React from 'react';
import { Zap, Activity, ShieldCheck, Coins } from 'lucide-react';
import { NodeType, DrumTrack } from './types';

export const CLUSTER_CONFIG = {
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

const createInitialSteps = (interval: number) => Array(16).fill(false).map((_, i) => i % interval === 0);
const createInitialValues = (val: number) => Array(16).fill(val);

export const INITIAL_DRUM_TRACKS: DrumTrack[] = [
  { 
    id: 'bd', name: 'Kick_808', color: 'emerald', npuMod: 0.1, mute: false, solo: false, volume: 0.8, lastStep: 16,
    engine: 'LMMS',
    steps: createInitialSteps(4), velocities: createInitialValues(0.9), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'sn', name: 'Snare_DX', color: 'fuchsia', npuMod: 0.3, mute: false, solo: false, volume: 0.7, lastStep: 16,
    engine: 'LMMS',
    steps: createInitialSteps(8).map((v, i) => i === 4 || i === 12), velocities: createInitialValues(0.7), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'cp', name: 'Clap_Analog', color: 'amber', npuMod: 0.4, mute: false, solo: false, volume: 0.6, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(8).map((v, i) => i === 4 || i === 12), velocities: createInitialValues(0.6), probabilities: createInitialValues(0.9) 
  },
  { 
    id: 'hh', name: 'Closed_Hat', color: 'cyan', npuMod: 0.8, mute: false, solo: false, volume: 0.5, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(2), velocities: Array(16).fill(0).map((_, i) => i % 2 === 0 ? 0.6 : 0.3), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'oh', name: 'Open_Hat', color: 'sky', npuMod: 0.5, mute: false, solo: false, volume: 0.4, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(8).map((v, i) => i === 2 || i === 10), velocities: createInitialValues(0.5), probabilities: createInitialValues(0.8) 
  },
  { 
    id: 'tm', name: 'Tom_808', color: 'indigo', npuMod: 0.2, mute: false, solo: false, volume: 0.6, lastStep: 16,
    engine: 'LMMS',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.7), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'rs', name: 'Rimshot_707', color: 'rose', npuMod: 0.6, mute: false, solo: false, volume: 0.5, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.6), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'bs', name: 'Sub_Bass', color: 'red', npuMod: 0.3, mute: false, solo: false, volume: 0.7, lastStep: 16,
    engine: 'ZynAddSubFX',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.8), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'ld', name: 'Poly_Lead', color: 'violet', npuMod: 0.7, mute: false, solo: false, volume: 0.5, lastStep: 16,
    engine: 'ZynAddSubFX',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.6), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'ai', name: 'Neural_FX', color: 'emerald', npuMod: 1.0, mute: false, solo: false, volume: 0.6, lastStep: 12,
    engine: 'ZynAddSubFX',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.6), probabilities: createInitialValues(0.5) 
  },
];
