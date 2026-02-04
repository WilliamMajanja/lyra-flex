
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Trash2, Copy, Plus, Waves, Music, Activity, 
  Settings2, ChevronDown, Monitor, Keyboard, Sliders, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrumTrack, SequencerState, Clip } from '../types';
import { NOTES, SCALES, TIME_SIGNATURES } from '../constants';

interface Props {
  externalState: SequencerState;
  onStateChange: (state: SequencerState) => void;
}

const DraggableBPM: React.FC<{ value: number, onChange: (newValue: number) => void }> = ({ value, onChange }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startBpm = value;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newBpm = Math.round(startBpm - (moveEvent.clientY - startY) * 0.5);
      onChange(Math.max(40, Math.min(300, newBpm)));
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  return <div 
    onMouseDown={handleMouseDown}
    className="px-2 lg:px-3 py-1 bg-black/40 rounded-lg border border-white/10 text-sm lg:text-xl font-black font-mono text-emerald-400 focus:outline-none cursor-ns-resize select-none flex items-center gap-1 lg:gap-2 active:bg-black/60 transition-colors"
  >
    {value} <span className="text-[7px] lg:text-[10px] text-gray-500 uppercase tracking-tighter">BPM</span>
  </div>
}

const Knob: React.FC<{value: number, onChange: (v:number) => void, color: string}> = ({ value, onChange, color }) => {
    const knobRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = (e: React.MouseEvent) => {
        const startY = e.clientY;
        const startValue = value;
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = (startY - moveEvent.clientY) / 100; // Sensitivity
            onChange(Math.max(0, Math.min(1, startValue + delta)));
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    return (
        <div ref={knobRef} onMouseDown={handleMouseDown} className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center cursor-ns-resize relative shadow-inner">
            <div className={`absolute h-3 w-[3px] bg-${color}-400 rounded-full top-1`} style={{ transform: `rotate(${ -135 + (value * 270)}deg)`, transformOrigin: 'bottom center' }} />
        </div>
    );
};


const DrumMachine: React.FC<Props> = ({ externalState, onStateChange }) => {
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const [activeEditor, setActiveEditor] = useState<'velocity' | 'probability' | 'pitch'>('velocity');
  const [currentStep, setCurrentStep] = useState(-1);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContextClass();
      masterGainRef.current = audioCtxRef.current.createGain();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      masterGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          initAudio();
          onStateChange({ ...externalState, isPlaying: !externalState.isPlaying });
          break;
        case 'ArrowUp':
          e.preventDefault();
          onStateChange({ ...externalState, bpm: Math.min(300, externalState.bpm + 1) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          onStateChange({ ...externalState, bpm: Math.max(40, externalState.bpm - 1) });
          break;
        case 'KeyV': setActiveEditor('velocity'); break;
        case 'KeyP': setActiveEditor('pitch'); break;
        case 'KeyB': setActiveEditor('probability'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [externalState, onStateChange, initAudio]);

  const drawMeter = useCallback(() => {
    if (analyserRef.current && externalState.isPlaying) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = Math.abs(dataArray[i] - 128) / 128;
        if (value > peak) peak = value;
      }
      setPeakLevel(peak);
    } else {
      setPeakLevel(p => Math.max(0, p * 0.95));
    }
    animationFrameRef.current = requestAnimationFrame(drawMeter);
  }, [externalState.isPlaying]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawMeter);
    return () => { if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current) };
  }, [drawMeter]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(masterVolume, audioCtxRef.current?.currentTime ?? 0, 0.01);
    }
  }, [masterVolume]);
  
  const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

  const triggerSynth = useCallback((track: DrumTrack, clip: Clip, stepIdx: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) return;
    const soloActive = externalState.tracks.some(t => t.solo && !t.mute);
    if (track.mute || (soloActive && !track.solo)) return;

    const vol = clip.velocities[stepIdx] * track.volume;
    const time = ctx.currentTime;
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, time);
    voiceGain.gain.linearRampToValueAtTime(vol, time + 0.005);

    const filter = ctx.createBiquadFilter();
    filter.type = track.id === 'hh' ? 'highpass' : 'lowpass';
    filter.frequency.setValueAtTime(track.frequency * 18000 + 100, time);
    filter.Q.setValueAtTime(1.5, time);

    voiceGain.connect(filter);
    filter.connect(masterGainRef.current);

    if (['bd', 'bs', 'ld', 'tm'].includes(track.id)) {
      const osc = ctx.createOscillator();
      const pitch = clip.pitches[stepIdx] + (track.id === 'bd' ? 24 : 36);
      osc.frequency.setValueAtTime(midiToFreq(pitch), time);
      if (track.id === 'bd') {
        osc.frequency.exponentialRampToValueAtTime(midiToFreq(pitch - 12), time + 0.1);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
      } else {
        osc.type = track.id === 'ld' ? 'sawtooth' : 'sine';
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
      }
      osc.connect(voiceGain); osc.start(time); osc.stop(time + 0.5);
    } else {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + (track.id === 'hh' ? 0.05 : 0.2));
      noise.connect(voiceGain); noise.start(time); noise.stop(time + 0.2);
    }
  }, [externalState.tracks]);

  const advanceStep = useCallback(() => {
    setCurrentStep(prevStep => {
      const newStep = (prevStep + 1) % 16;
      externalState.tracks.forEach((track) => {
        const clip = track.clips[track.activeClipIndex];
        if (!clip) return;
        if (clip.steps[newStep] && Math.random() <= clip.probabilities[newStep]) {
          triggerSynth(track, clip, newStep);
        }
      });
      return newStep;
    });
  }, [externalState.tracks, triggerSynth]);

  useEffect(() => {
    if (externalState.isPlaying) {
      if (currentStep === -1) setCurrentStep(0);
      const stepTime = (60 / externalState.bpm / 4) * 1000;
      timerRef.current = window.setInterval(advanceStep, stepTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentStep(-1);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [externalState.isPlaying, externalState.bpm, advanceStep]);

  const updateTrack = (tIdx: number, newProps: Partial<DrumTrack>) => {
    const newTracks = [...externalState.tracks];
    newTracks[tIdx] = { ...newTracks[tIdx], ...newProps };
    onStateChange({ ...externalState, tracks: newTracks });
  };
  
  const createNewClip = (tIdx: number) => {
    const newTracks = [...externalState.tracks];
    const track = newTracks[tIdx];
    if (track.clips.length < 4) {
      const newClip: Clip = { id: `clip_${Math.random()}`, steps: Array(16).fill(false), velocities: Array(16).fill(0.8), probabilities: Array(16).fill(1), pitches: Array(16).fill(12), length: 16, timeSignature: externalState.timeSignature };
      track.clips.push(newClip);
      track.activeClipIndex = track.clips.length - 1;
      onStateChange({ ...externalState, tracks: newTracks });
    }
  };


  const updateClip = (tIdx: number, cIdx: number, newProps: Partial<Clip>) => {
    const newTracks = [...externalState.tracks];
    const newClips = [...newTracks[tIdx].clips];
    newClips[cIdx] = { ...newClips[cIdx], ...newProps };
    newTracks[tIdx].clips = newClips;
    onStateChange({ ...externalState, tracks: newTracks });
  };
  
  const handleEditorDrag = (sIdx: number, e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const val = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    const activeClip = externalState.tracks[selectedTrackIdx].clips[externalState.tracks[selectedTrackIdx].activeClipIndex];
    
    if (activeEditor === 'velocity') {
      const newVs = [...activeClip.velocities]; newVs[sIdx] = val;
      updateClip(selectedTrackIdx, externalState.tracks[selectedTrackIdx].activeClipIndex, { velocities: newVs });
    } else if (activeEditor === 'probability') {
      const newPs = [...activeClip.probabilities]; newPs[sIdx] = val;
      updateClip(selectedTrackIdx, externalState.tracks[selectedTrackIdx].activeClipIndex, { probabilities: newPs });
    } else {
      const newPitches = [...activeClip.pitches]; newPitches[sIdx] = Math.round(val * 24);
      updateClip(selectedTrackIdx, externalState.tracks[selectedTrackIdx].activeClipIndex, { pitches: newPitches });
    }
  };

  const selectedTrack = externalState.tracks[selectedTrackIdx];
  const activeClip = selectedTrack?.clips[selectedTrack.activeClipIndex];

  return (
    <div className="glass-panel p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-white/5 flex flex-col gap-4 lg:gap-8 h-full relative overflow-hidden shadow-2xl" onMouseUp={() => setIsPainting(false)} onTouchEnd={() => setIsPainting(false)}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
         <div className="flex items-center gap-3 lg:gap-6 w-full md:w-auto justify-between md:justify-start">
            <h2 className="text-sm lg:text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              CONSOLE PRO
              {externalState.isPlaying && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} 
                  transition={{ duration: 0.3, repeat: Infinity }} 
                  className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                />
              )}
            </h2>
            <div className="flex items-center gap-2 lg:gap-4 bg-black/60 p-1.5 rounded-xl border border-white/10 shadow-inner px-3">
               <button 
                 onClick={() => { initAudio(); onStateChange({ ...externalState, isPlaying: !externalState.isPlaying }); }} 
                 className={`p-2.5 lg:p-3 rounded-lg transition-all active:scale-90 ${externalState.isPlaying ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 hover:bg-white/10'}`}
               >
                  {externalState.isPlaying ? <Pause className="w-4 h-4 lg:w-5 lg:h-5 fill-current" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />}
               </button>
               <DraggableBPM value={externalState.bpm} onChange={bpm => onStateChange({...externalState, bpm})} />
            </div>
         </div>
         
         <div className="flex items-center gap-4 w-full md:w-auto justify-end">
           <div className="flex-grow md:flex-grow-0 md:w-48 h-2 bg-black/50 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
              <motion.div className="absolute top-0 left-0 h-full bg-emerald-500 transition-[width] duration-75" style={{width: `${peakLevel * 100}%`}} />
           </div>
           <input type="range" min={0} max={1} step={0.01} value={masterVolume} onChange={e => setMasterVolume(parseFloat(e.target.value))} className="w-20 lg:w-28 accent-emerald-500 cursor-pointer" />
         </div>
      </div>

      <div className="w-full flex gap-1 lg:gap-1.5 px-2">
         {Array.from({ length: 16 }).map((_, i) => (
           <div 
             key={i} 
             className={`h-1.5 lg:h-2 flex-grow rounded-full transition-all duration-100 ${
               currentStep === i ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-y-125' : 'bg-white/5'
             }`} 
           />
         ))}
      </div>

      <div className="flex-grow flex flex-col xl:flex-row gap-6 lg:gap-8 min-h-0">
         <div className="w-full xl:w-96 flex xl:flex-col gap-3 shrink-0 overflow-x-auto xl:overflow-y-auto no-scrollbar pb-3 xl:pb-0">
            {externalState.tracks.map((track, tIdx) => {
               const isActive = selectedTrackIdx === tIdx;
               return (
                <div key={track.id} onClick={() => setSelectedTrackIdx(tIdx)} className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all relative shrink-0 xl:shrink border cursor-pointer ${isActive ? 'bg-white/10 border-white/10 shadow-lg' : 'opacity-50 border-transparent hover:opacity-80 hover:bg-white/[0.03]'}`}>
                   <div className="flex flex-col items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest text-${track.color}-400`}>{track.name}</span>
                        <div className="flex gap-1.5">
                            <Knob value={track.frequency} onChange={v => updateTrack(tIdx, { frequency: v })} color={track.color} />
                            <div className="w-2 bg-black/40 rounded-full overflow-hidden relative">
                                <div className={`absolute bottom-0 w-full bg-${track.color}-500 transition-all`} style={{height: `${track.volume * 100}%`}} />
                            </div>
                            <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={e => updateTrack(tIdx, { volume: parseFloat(e.target.value) })} className={`w-10 accent-${track.color}-500`} style={{writingMode: 'vertical-lr', direction: 'rtl'}} />
                        </div>
                   </div>
                   
                   <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-2">
                      {Array.from({length: 4}).map((_, cIdx) => {
                          const clip = track.clips[cIdx];
                          if (clip) {
                              return <button 
                                key={clip.id} 
                                onClick={(e) => { e.stopPropagation(); updateTrack(tIdx, { activeClipIndex: cIdx }) }} 
                                className={`w-full h-10 rounded-xl transition-all border font-black text-[10px] active:scale-95 flex items-center justify-center ${track.activeClipIndex === cIdx ? `bg-${track.color}-500 border-${track.color}-400 text-black shadow-lg` : 'bg-white/5 border-transparent text-gray-600 hover:text-white'}`}
                              >
                                  {clip.steps.some(s => s) ? <Waves className="w-4 h-4" /> : <span className="text-gray-700">-</span>}
                              </button>
                          }
                          return <button 
                            key={cIdx} 
                            onClick={(e) => { e.stopPropagation(); createNewClip(tIdx); }}
                            className="w-full h-10 rounded-xl bg-black/40 border border-dashed border-white/10 text-white/20 hover:text-white hover:border-white/30 transition-all flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                      })}
                   </div>
                   
                   <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); updateTrack(tIdx, { solo: !track.solo }) }} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[9px] font-black transition-colors ${track.solo ? 'bg-amber-500 text-black shadow-md' : 'bg-black/50 text-gray-500'}`}>S</button>
                        <button onClick={(e) => { e.stopPropagation(); updateTrack(tIdx, { mute: !track.mute }) }} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[9px] font-black transition-colors ${track.mute ? 'bg-red-500 text-black shadow-md' : 'bg-black/50 text-gray-500'}`}>M</button>
                   </div>
                </div>
               );
            })}
         </div>

         {activeClip && (
            <div className="flex-grow bg-black/60 rounded-[2rem] p-4 lg:p-6 border border-white/5 overflow-hidden relative flex flex-col shadow-2xl">
               <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Sequence</span>
                    <span className="text-[8px] font-mono text-emerald-500/60 uppercase">Step-Locked Loop // 16 Gates</span>
                 </div>
                 <div className="flex items-center gap-3 lg:hidden">
                    <span className="text-[8px] font-mono text-cyan-500 animate-pulse uppercase tracking-widest">Swipe Grid</span>
                 </div>
               </div>
               
               <div className="flex-grow overflow-x-auto no-scrollbar touch-pan-x cursor-crosshair">
                 <div className="grid grid-cols-16 gap-2 lg:gap-3 min-w-[760px] lg:min-w-0 h-full pb-2">
                   {Array.from({ length: 16 }).map((_, sIdx) => {
                      const isBeatStart = sIdx % 4 === 0;
                      return (
                        <button 
                          key={sIdx} 
                          onMouseDown={() => { 
                            const targetState = !activeClip.steps[sIdx];
                            setPaintMode(targetState);
                            setIsPainting(true);
                            const newSteps = [...activeClip.steps]; newSteps[sIdx] = targetState; 
                            updateClip(selectedTrackIdx, selectedTrack.activeClipIndex, { steps: newSteps });
                          }} 
                          onMouseEnter={() => {
                            if (isPainting && activeClip.steps[sIdx] !== paintMode) {
                              const newSteps = [...activeClip.steps]; newSteps[sIdx] = paintMode;
                              updateClip(selectedTrackIdx, selectedTrack.activeClipIndex, { steps: newSteps });
                            }
                          }}
                          className={`rounded-xl lg:rounded-2xl relative transition-all duration-75 transform active:scale-90 ${
                            activeClip.steps[sIdx] ? `bg-${selectedTrack.color}-500 shadow-lg shadow-${selectedTrack.color}-500/20` : 'bg-white/[0.04] hover:bg-white/[0.08]'
                          } ${currentStep === sIdx ? 'ring-2 ring-white scale-105 z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''} ${isBeatStart ? 'border-l-2 border-white/20' : ''}`} 
                        />
                      );
                   })}
                 </div>
               </div>
            </div>
         )}
      </div>

      {activeClip && (
         <div className="h-52 lg:h-64 shrink-0 bg-black/50 rounded-[2rem] border border-white/5 p-4 lg:p-6 flex flex-col gap-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-2 shrink-0">
               <div className="flex bg-black/80 p-1 rounded-xl border border-white/10 shadow-inner">
                 {['velocity', 'probability', 'pitch'].map(editor => (
                    <button 
                      key={editor} 
                      onClick={() => setActiveEditor(editor as any)} 
                      className={`px-4 lg:px-6 py-1.5 lg:py-2 text-[9px] lg:text-[11px] uppercase font-black rounded-lg transition-all active:scale-95 ${activeEditor === editor ? `bg-${selectedTrack.color}-500 text-black shadow-lg` : 'text-gray-500 hover:text-white'}`}
                    >
                      {editor}
                    </button>
                 ))}
               </div>
               <div className="flex items-center gap-3">
                 <button onClick={() => { if(selectedTrack.clips.length < 4) {const newClip = JSON.parse(JSON.stringify(activeClip)); newClip.id = `clip_${Math.random()}`; updateTrack(selectedTrackIdx, { clips: [...selectedTrack.clips, newClip]})}}} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-emerald-400 transition-all active:scale-90"><Copy className="w-4 h-4" /></button>
                 <button onClick={() => { if(selectedTrack.clips.length > 1) { const newClips = selectedTrack.clips.filter((_,i) => i !== selectedTrack.activeClipIndex); updateTrack(selectedTrackIdx, { clips: newClips, activeClipIndex: 0 })}}} className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-red-400 transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>

            <div className="flex-grow overflow-x-auto no-scrollbar touch-pan-x pt-2">
              <div className="grid grid-cols-16 gap-1.5 relative h-full min-w-[760px] lg:min-w-0">
                 {Array.from({length: 16}).map((_, sIdx) => {
                    let value, display;
                    if (activeEditor === 'velocity') { value = activeClip.velocities[sIdx]; display = `${Math.round(value * 100)}%`; }
                    else if (activeEditor === 'probability') { value = activeClip.probabilities[sIdx]; display = `${Math.round(value * 100)}%`; }
                    else { 
                      value = activeClip.pitches[sIdx] / 24; 
                      display = `${NOTES[activeClip.pitches[sIdx] % 12]}${Math.floor(activeClip.pitches[sIdx]/12)+2}`;
                    }
                    return (
                       <div 
                        key={sIdx} 
                        className={`w-full h-full bg-white/[0.03] rounded-xl overflow-hidden relative group cursor-ns-resize transition-colors hover:bg-white/[0.06] ${currentStep === sIdx ? 'ring-1 ring-white/20' : ''}`} 
                        onMouseDown={(e) => {setIsPainting(true); handleEditorDrag(sIdx, e);}} 
                        onMouseEnter={(e) => {if(isPainting) handleEditorDrag(sIdx, e)}}
                        onTouchMove={(e) => { if(isPainting) handleEditorDrag(sIdx, e); e.preventDefault(); }} 
                        onTouchStart={() => setIsPainting(true)}
                       >
                          {activeClip.steps[sIdx] && (
                            <motion.div 
                              style={{ height: `${value * 100}%` }} 
                              className={`w-full absolute bottom-0 bg-${selectedTrack.color}-500/60 pointer-events-none rounded-t-lg shadow-[0_0_15px_rgba(var(--tw-shadow-color),0.3)]`} 
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[8px] font-mono text-white/50 font-black">{display}</div>
                       </div>
                    );
                 })}
              </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default DrumMachine;
