
import React, { useState, useEffect } from 'react';
import { Disc, DollarSign, CloudUpload, ShieldCheck, Sparkles, Zap, ArrowRight, CheckCircle2, Music, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordingState } from '../types';

interface Props {
  onMint: (hash: string) => void;
}

const MonetizationPanel: React.FC<Props> = ({ onMint }) => {
  const [recording, setRecording] = useState<RecordingState>({
    isActive: false,
    duration: 0,
    fileSize: 0,
    status: 'idle'
  });

  useEffect(() => {
    let timer: number;
    if (recording.isActive && recording.status === 'recording') {
      timer = window.setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1,
          fileSize: prev.fileSize + (Math.random() * 0.15)
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording.isActive, recording.status]);

  const toggleRecording = () => {
    if (!recording.isActive) {
      setRecording({ isActive: true, duration: 0, fileSize: 0, status: 'recording' });
    } else {
      setRecording(prev => ({ ...prev, status: 'processing' }));
      setTimeout(() => {
        setRecording(prev => ({ ...prev, status: 'ready' }));
      }, 4000);
    }
  };

  const handleMint = () => {
    const fakeHash = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase();
    onMint(fakeHash);
    setRecording({ isActive: false, duration: 0, fileSize: 0, status: 'idle' });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] flex flex-col gap-6 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Monetization Hub</h3>
            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter mt-0.5">DAW STEMS & Performance Asset Capturing</p>
          </div>
        </div>
        {recording.status === 'recording' && (
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Mastering Active</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
          <span className="text-[8px] font-mono text-gray-500 uppercase block tracking-widest">Session Length</span>
          <span className="text-2xl font-black text-white font-mono tracking-tighter">{formatTime(recording.duration)}</span>
        </div>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1 text-right">
          <span className="text-[8px] font-mono text-gray-500 uppercase block tracking-widest">Hi-Fi PCM Stream</span>
          <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{recording.fileSize.toFixed(1)} <span className="text-[10px] text-gray-600 ml-1">MB</span></span>
        </div>
      </div>

      <div className="bg-black/60 rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center relative min-h-[160px] group overflow-hidden">
        <AnimatePresence mode="wait">
          {recording.status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                <Music className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest max-w-[200px]">System Awaiting Performance Input</p>
            </motion.div>
          )}
          
          {recording.status === 'recording' && (
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
               <div className="flex gap-1.5 h-10 items-end">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: [4, Math.random() * 32 + 8, 4] }} 
                      transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1.5 bg-red-500 rounded-t-sm" 
                    />
                  ))}
               </div>
               <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-[0.3em]">Direct Master Capturing</span>
            </motion.div>
          )}

          {recording.status === 'processing' && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 border border-dashed border-cyan-500/20 rounded-full"
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-[0.4em]">Compiling DAW STEMS</span>
            </motion.div>
          )}

          {recording.status === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 w-full">
              <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-widest block">Release Ready Assets</span>
                <span className="text-[8px] font-mono text-gray-500 uppercase">24-bit STEMS + Ableton Project Finalized</span>
              </div>
              <button 
                onClick={handleMint}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <CloudUpload className="w-4 h-4" /> Mint & Export Pro Assets
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={toggleRecording}
        disabled={recording.status === 'processing' || recording.status === 'ready'}
        className={`w-full py-5 rounded-xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${
          recording.status === 'recording' 
            ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
        }`}
      >
        {recording.status === 'recording' ? (
          <><div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Finalize Master & Export Project</>
        ) : (
          <><Zap className="w-4 h-4" /> Start Pro Session Capture</>
        )}
      </button>
    </div>
  );
};

export default MonetizationPanel;