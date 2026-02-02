
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Zap, Clock, RefreshCcw, Activity, Power, 
  Loader2, Link2, Settings2, ShieldCheck, CpuIcon, Code2, 
  Lock, CheckCircle, Radio, Brain, Network, Cpu as CpuIcon2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  currentGen: number;
  onGenChange: (gen: number) => void;
}

const PCIeLaneManager: React.FC<Props> = ({ currentGen, onGenChange }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [latency, setLatency] = useState(0.42);
  const [isReinitializing, setIsReinitializing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing) {
        // Gen 3 has lower latency floor than Gen 2
        const floor = currentGen === 3 ? 0.12 : 0.45;
        const drift = (Math.random() - 0.4) * 0.1;
        setLatency(prev => Math.max(floor, Math.min(1.2, prev + drift)));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isSyncing, currentGen]);

  return (
    <div className="glass-panel p-8 rounded-[2rem] border border-white/5 space-y-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg">
              <CpuIcon2 className="w-6 h-6 text-cyan-400" />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Hardware Bridge</h3>
              <p className="text-[10px] font-mono text-gray-600 uppercase mt-1 tracking-widest font-bold">PCIe Native Interface</p>
           </div>
        </div>
        <div className="flex gap-2 p-1.5 bg-black/60 rounded-xl border border-white/10 shadow-inner">
          {[2, 3].map((gen) => (
            <button
              key={gen}
              onClick={() => onGenChange(gen)}
              className={`px-5 py-2 rounded-lg text-[10px] font-mono font-black transition-all ${
                currentGen === gen ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-600 hover:text-white hover:bg-white/5'
              }`}
            >
              GEN {gen}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-28 bg-black/80 rounded-[1.8rem] border border-white/5 flex items-center justify-between px-10 overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center gap-2 relative z-10">
           <Cpu className="w-6 h-6 text-gray-500" />
           <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest font-black">BCM2712 Host</span>
        </div>

        <div className="flex-grow flex items-center justify-center px-10">
           <div className="relative w-full h-[1px] bg-white/10">
              <motion.div 
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: currentGen === 3 ? 0.6 : 1.2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[7px] font-mono text-cyan-500/40 uppercase tracking-[0.4em] font-black">
                 {currentGen === 3 ? '8.0 GT/s Lane' : '5.0 GT/s Lane'}
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-2 relative z-10">
           <Brain className="w-6 h-6 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
           <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">AI NPU Target</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
         <div className="p-6 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-2 group shadow-inner">
            <span className="text-[9px] font-black uppercase text-gray-700 tracking-[0.2em] group-hover:text-cyan-400 transition-colors">Bus Latency</span>
            <div className="flex items-baseline gap-2">
               <motion.span 
                 key={latency.toFixed(2)}
                 initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                 className="text-3xl font-black text-white font-mono tracking-tighter"
               >
                 {latency.toFixed(2)}
               </motion.span>
               <span className="text-[10px] font-mono text-cyan-500 uppercase font-bold">ms</span>
            </div>
         </div>
         <div className="p-6 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-2 group shadow-inner">
            <span className="text-[9px] font-black uppercase text-gray-700 tracking-[0.2em] group-hover:text-cyan-400 transition-colors">Parity Check</span>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white font-mono tracking-tighter">100</span>
               <span className="text-[10px] font-mono text-cyan-500 uppercase font-bold">%</span>
            </div>
         </div>
      </div>

      <button 
        onClick={() => { setIsReinitializing(true); setTimeout(() => setIsReinitializing(false), 1500); }}
        className="w-full py-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
      >
        {isReinitializing ? (
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        ) : (
          <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
        )}
        Synchronize DMA Buffer
      </button>
    </div>
  );
};

export default PCIeLaneManager;
