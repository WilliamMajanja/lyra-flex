
export enum NodeType {
  NEBULA = 'NEBULA',
  PULSE = 'PULSE',
  BRAIN = 'BRAIN'
}

export interface MinimaNodeStatus {
  blockHeight: number;
  walletBalance: number;
  peers: number;
  licenseVerified: boolean;
  provenanceHash: string;
}

export interface NodeTelemetry {
  id: string;
  type: NodeType;
  cpuTemp: number;
  cpuLoad: number;
  ramUsage: number;
  npuTops: number;
  storageUsage: number;
  fanRpm: number;
  coolingStatus: 'optimal' | 'throttled' | 'critical';
  status: 'online' | 'offline' | 'busy';
}

export type NativeEngine = 'AirLLM' | 'Mixxx' | 'LMMS' | 'ZynAddSubFX' | 'PipeWire';

export interface MasteringChainState {
  limiter: number;
  saturation: number;
  width: number;
  eqHigh: number;
}

export interface RecordingState {
  isActive: boolean;
  duration: number;
  fileSize: number;
  status: 'recording' | 'processing' | 'ready' | 'idle';
}

export interface DrumTrack {
  id: string;
  name: string;
  steps: boolean[];
  velocities: number[];      
  probabilities: number[];   
  lastStep: number;          
  color: string;
  npuMod: number;            
  mute: boolean;
  volume: number;            
  engine: NativeEngine;      
}

export interface SequencerState {
  isPlaying: boolean;
  bpm: number;
  currentSteps: number[]; 
  tracks: DrumTrack[];
}
