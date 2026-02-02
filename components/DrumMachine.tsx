
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Settings2, Layers, BarChart, Percent, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DrumTrack, SequencerState, MasteringChainState, NativeEngine } from '../types';
import { INITIAL_DRUM_TRACKS } from '../constants';

interface Props {
  externalState: SequencerState;
  onStateChange: (state: SequencerState) => void;
}

const DrumMachine: React.FC<Props> = ({ externalState, onStateChange }) => {
  const [localSeq, setLocalSeq] = useState<SequencerState>(externalState);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const [activeParam, setActiveParam] = useState<'step' | 'velocity' | 'probability' | 'lastStep'>('step');
  
  const [mastering, setMastering] = useState<MasteringChainState>({
    limiter: 0.85,
    saturation: 0.45,
    width: 0.60,
    eqHigh: 0.30
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const limiterNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const airEqNodeRef = useRef<BiquadFilterNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const meterLevels = useRef<number[]>(new Array(INITIAL_DRUM_TRACKS.length).fill(0));
  const masterMeter = useRef<number>(0);

  // Sync state from external changes (AI or parent updates)
  useEffect(() => {
    setLocalSeq(externalState);
  }, [externalState]);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContextClass();
      
      masterGainRef.current = audioCtxRef.current.createGain();
      limiterNodeRef.current = audioCtxRef.current.createDynamicsCompressor();
      airEqNodeRef.current = audioCtxRef.current.createBiquadFilter();

      airEqNodeRef.current.type = 'highshelf';
      airEqNodeRef.current.frequency.setValueAtTime(10000, audioCtxRef.current.currentTime);
      
      limiterNodeRef.current.threshold.setValueAtTime(-1.0, audioCtxRef.current.currentTime);
      limiterNodeRef.current.knee.setValueAtTime(0, audioCtxRef.current.currentTime);
      limiterNodeRef.current.ratio.setValueAtTime(20, audioCtxRef.current.currentTime);
      
      masterGainRef.current.connect(airEqNodeRef.current);
      airEqNodeRef.current.connect(limiterNodeRef.current);
      limiterNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  // Update mastering parameters in real-time
  useEffect(() => {
    if (airEqNodeRef.current && limiterNodeRef.current && audioCtxRef.current) {
      const time = audioCtxRef.current.currentTime;
      airEqNodeRef.current.gain.setTargetAtTime(mastering.eqHigh * 12, time, 0.1);
      limiterNodeRef.current.threshold.setTargetAtTime(-20 + (mastering.limiter * 18), time, 0.1);
    }
  }, [mastering]);

  const triggerSynth = useCallback((track: DrumTrack, trackIdx: number, stepIdx: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) return;

    const vol = track.velocities[stepIdx] * track.volume;
    meterLevels.current[trackIdx] = vol;
    masterMeter.current = Math.min(1.0, masterMeter.current + vol * 0.1);

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    if (track.id === 'bd') {
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(44, ctx.currentTime + 0.1);
      osc.connect(voiceGain);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (['sn', 'hh', 'oh'].includes(track.id)) {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = track.id === 'sn' ? 'bandpass' : 'highpass';
      filter.frequency.setValueAtTime(track.id === 'sn' ? 1500 : 8000, ctx.currentTime);
      noise.connect(filter); filter.connect(voiceGain);
      noise.start();
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220 * (trackIdx + 1), ctx.currentTime);
      osc.connect(voiceGain);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }

    voiceGain.connect(masterGainRef.current);
    setTimeout(() => {
      meterLevels.current[trackIdx] *= 0.8;
      masterMeter.current *= 0.9;
    }, 40);
  }, []);

  const advanceStep = useCallback(() => {
    setLocalSeq(prev => {
      const nextSteps = prev.currentSteps.map((s, i) => (s + 1) % prev.tracks[i].lastStep);
      nextSteps.forEach((step, idx) => {
        const track = prev.tracks[idx];
        if (track.steps[step] && !track.mute) {
          if (Math.random() <= track.probabilities[step]) triggerSynth(track, idx, step);
        }
      });
      return { ...prev, currentSteps: nextSteps };
    });
  }, [triggerSynth]);

  useEffect(() => {
    if (localSeq.isPlaying) {
      const stepTime = (60 / localSeq.bpm / 4) * 1000;
      timerRef.current = window.setInterval(advanceStep, stepTime);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [localSeq.isPlaying, localSeq.bpm, advanceStep]);

  const handleTogglePlay = () => {
    initAudio();
    const newState = { ...localSeq, isPlaying: !localSeq.isPlaying };
    setLocalSeq(newState);
    onStateChange(newState);
  };

  const toggleStep = (tIdx: number, sIdx: number) => {
    initAudio();
    const newTracks = [...localSeq.tracks];
    newTracks[tIdx] = { ...newTracks[tIdx], steps: [...newTracks[tIdx].steps] };
    newTracks[tIdx].steps[sIdx] = !newTracks[tIdx].steps[sIdx];
    const newState = { ...localSeq, tracks: newTracks };
    setLocalSeq(newState);
    onStateChange(newState);
  };

  const updateVolume = (tIdx: number, val: number) => {
    const newTracks = [...localSeq.tracks];
    newTracks[tIdx] = { ...newTracks[tIdx], volume: val };
    const newState = { ...localSeq, tracks: newTracks };
    setLocalSeq(newState);
    onStateChange(newState);
  };

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-10 h-full relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-10">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Console PRO</h2>
              <div className="flex items-center gap-4">
                 <div className={`w-2 h-2 rounded-full ${localSeq.isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-gray-800'}`} />
                 <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-black">Native Engine v.FX</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
             <button 
              onClick={handleTogglePlay}
              className={`p-5 rounded-xl transition-all ${localSeq.isPlaying ? 'bg-emerald-500 text-black shadow-lg scale-105' : 'bg-white/5 text-gray-400 hover:text-white'}`}
             >
              {localSeq.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
             </button>
             <div className="px-6 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">Global BPM</span>
                <span className="text-xl font-black text-white font-mono tracking-tighter">{localSeq.bpm}</span>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-2 bg-black/80 p-1.5 rounded-2xl border border-white/10 shadow-2xl">
           {[
             { id: 'step', icon: <Layers className="w-4 h-4" />, label: 'Gate' },
             { id: 'velocity', icon: <BarChart className="w-4 h-4" />, label: 'Velo' },
             { id: 'probability', icon: <Percent className="w-4 h-4" />, label: 'Prob' },
           ].map(p => (
             <button
               key={p.id}
               onClick={() => setActiveParam(p.id as any)}
               className={`px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${activeParam === p.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {p.icon}
               <span className="text-[10px] font-black uppercase tracking-widest hidden 2xl:inline">{p.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-4 relative z-10 overflow-y-auto no-scrollbar">
        {localSeq.tracks.map((track, tIdx) => (
          <div key={track.id} className={`flex items-stretch gap-6 transition-all duration-300 ${selectedTrackIdx === tIdx ? 'opacity-100 scale-[1.01]' : 'opacity-20 hover:opacity-40 grayscale'}`}>
            <div 
              onClick={() => setSelectedTrackIdx(tIdx)}
              className={`w-44 shrink-0 flex flex-col gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${selectedTrackIdx === tIdx ? 'bg-white/5 border-white/20 shadow-xl' : 'border-transparent'}`}
            >
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[100px]">{track.name}</span>
                  <div className={`w-2 h-2 rounded-full bg-${track.color}-500 shadow-lg`} />
               </div>
               
               <div className="h-12 w-full bg-black rounded-2xl relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
                  <motion.div 
                    animate={{ height: `${track.volume * 100}%` }}
                    className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-${track.color}-600/30 to-${track.color}-400/10`} 
                  />
                  <span className="text-[11px] font-black text-white relative z-10 font-mono">{(track.volume * 100).toFixed(0)}</span>
                  <input 
                    type="range" min="0" max="1" step="0.01" value={track.volume} 
                    onChange={(e) => updateVolume(tIdx, parseFloat(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
               </div>
            </div>

            <div className="flex-grow grid grid-cols-16 gap-3">
              {Array.from({ length: 16 }).map((_, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => toggleStep(tIdx, sIdx)}
                  className={`h-full rounded-2xl border transition-all relative overflow-hidden shadow-lg ${
                    localSeq.currentSteps[tIdx] === sIdx ? 'ring-2 ring-white/60 z-20 scale-[1.04]' : 'border-white/5'
                  } ${
                    sIdx >= track.lastStep ? 'opacity-0 pointer-events-none' : 
                    track.steps[sIdx] ? `bg-gradient-to-br from-${track.color}-700 to-${track.color}-400 border-white/20` : 'bg-black/80 hover:bg-white/10'
                  }`}
                >
                  {localSeq.currentSteps[tIdx] === sIdx && <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse" />}
                  {sIdx % 4 === 0 && !track.steps[sIdx] && localSeq.currentSteps[tIdx] !== sIdx && <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-8 bg-black/80 rounded-[2.5rem] border border-white/10 flex items-center justify-between gap-12 shadow-2xl relative z-10">
        <div className="flex gap-10 items-center">
           {[
             { id: 'limiter', label: 'Pro Ceiling', val: mastering.limiter, color: 'emerald' },
             { id: 'saturation', label: 'Valve Drive', val: mastering.saturation, color: 'amber' },
             { id: 'width', label: 'Stereo Imager', val: mastering.width, color: 'cyan' },
           ].map(item => (
             <div key={item.id} className="flex flex-col gap-3">
                <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">{item.label}</span>
                <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden relative shadow-inner">
                   <motion.div animate={{ width: `${item.val * 100}%` }} className={`h-full bg-${item.color}-500`} />
                   <input 
                     type="range" min="0" max="1" step="0.01" value={item.val} 
                     onChange={(e) => setMastering({...mastering, [item.id as keyof MasteringChainState]: parseFloat(e.target.value)})}
                     className="absolute inset-0 opacity-0 cursor-pointer" 
                   />
                </div>
             </div>
           ))}
        </div>

        <div className="flex items-end gap-1.5 h-12 w-64 bg-black/40 rounded-2xl p-4 border border-white/5 relative group overflow-hidden shadow-inner">
           {[...Array(32)].map((_, i) => (
             <motion.div 
               key={i} 
               animate={{ height: localSeq.isPlaying ? [4, (Math.random() * 30 + 5) * masterMeter.current, 4] : 4 }}
               transition={{ duration: 0.1, repeat: Infinity, delay: i * 0.01 }}
               className={`w-1 rounded-full ${i > 24 ? 'bg-red-500/60' : i > 18 ? 'bg-amber-500/60' : 'bg-emerald-500/40'}`} 
             />
           ))}
        </div>
      </div>
    </div>
  );
};

export default DrumMachine;
