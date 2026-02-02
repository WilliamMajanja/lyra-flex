
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
    id: 'bd', name: 'Kick_808', color: 'emerald', npuMod: 0.1, mute: false, volume: 0.8, lastStep: 16,
    engine: 'LMMS',
    steps: createInitialSteps(4), velocities: createInitialValues(0.9), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'sn', name: 'Snare_DX', color: 'fuchsia', npuMod: 0.3, mute: false, volume: 0.7, lastStep: 16,
    engine: 'LMMS',
    steps: createInitialSteps(8).map((v, i) => i === 4 || i === 12), velocities: createInitialValues(0.7), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'hh', name: 'Closed_Hat', color: 'cyan', npuMod: 0.8, mute: false, volume: 0.5, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(2), velocities: Array(16).fill(0).map((_, i) => i % 2 === 0 ? 0.6 : 0.3), probabilities: createInitialValues(1.0) 
  },
  { 
    id: 'oh', name: 'Open_Hat', color: 'amber', npuMod: 0.5, mute: false, volume: 0.4, lastStep: 16,
    engine: 'Mixxx',
    steps: createInitialSteps(8).map((v, i) => i === 2 || i === 10), velocities: createInitialValues(0.5), probabilities: createInitialValues(0.8) 
  },
  { 
    id: 'ai', name: 'Neural_FX', color: 'indigo', npuMod: 1.0, mute: false, volume: 0.6, lastStep: 12,
    engine: 'ZynAddSubFX',
    steps: createInitialSteps(16).fill(false), velocities: createInitialValues(0.6), probabilities: createInitialValues(0.5) 
  },
];

export const getSnippets = () => [
  {
    id: 'monetization-contract',
    title: "LyraFlex Performance Token",
    description: "Minima script to mint a provenance hash for a live recording.",
    language: "javascript",
    code: `// LyraFlex Monetization Script
LET performance_hash = 0xREC_SESSION_882A
LET royalty_split = 0.10 // 10% to Node Provider
IF (GET_BALANCE(TOKEN_ID) > 0) THEN
  SEND_FUNDS(ARTIST_ADDR, AMOUNT * (1 - royalty_split))
  MINT_ASSET(performance_hash, "Live Set - LyraFlex v.FX")
  RETURN TRUE
ENDIF`
  }
];
