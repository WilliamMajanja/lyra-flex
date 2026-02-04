
import React, { useState, useEffect } from 'react';
import { Network, Link2, Users, Power, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AbletonLinkManager: React.FC = () => {
  const [status, setStatus] = useState<'offline' | 'syncing' | 'linked'>('offline');
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    let timeout: number | undefined;

    if (status === 'syncing') {
      timeout = window.setTimeout(() => {
        setStatus('linked');
        setPeers(3); // Simulate finding peers
      }, 2500);
    } else if (status === 'linked') {
      interval = window.setInterval(() => {
        // Simulate peer count fluctuation
        setPeers(p => Math.max(1, Math.min(5, p + (Math.random() > 0.5 ? 1 : -1))));
      }, 5000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleToggle = () => {
    if (status === 'offline') {
      setStatus('syncing');
    } else {
      setStatus('offline');
      setPeers(0);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'linked': return { color: 'emerald', text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };
      case 'syncing': return { color: 'amber', text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' };
      default: return { color: 'gray', text: 'text-gray-600', border: 'border-gray-500/20', bg: 'bg-gray-500/10' };
    }
  };

  const { color, text, border, bg } = getStatusInfo();

  return (
    <div className="glass-panel p-8 rounded-[2rem] border border-white/5 space-y-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/20 to-transparent`} />
        
        <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
               <div className={`p-3 ${bg} rounded-2xl ${border} shadow-lg`}>
                  <Link2 className={`w-6 h-6 ${text}`} />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Ableton Link</h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase mt-1 tracking-widest font-bold">Tempo Sync Protocol</p>
               </div>
            </div>
            <button
              onClick={handleToggle}
              className={`p-2.5 rounded-full transition-all ${status !== 'offline' ? `bg-${color}-500 text-black shadow-lg` : 'bg-black/60 text-gray-600 hover:bg-white/5'}`}
            >
              <Power className="w-5 h-5" />
            </button>
        </div>

        <div className="relative h-28 bg-black/80 rounded-[1.8rem] border border-white/5 flex items-center justify-around px-10 overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center text-center gap-4"
                >
                    {status === 'offline' && (
                        <>
                            <Network className="w-10 h-10 text-gray-700" />
                            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest font-black">Link Disabled</span>
                        </>
                    )}
                    {status === 'syncing' && (
                        <>
                            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-black">Searching Peers...</span>
                        </>
                    )}
                    {status === 'linked' && (
                        <>
                            <div className="relative">
                                <Users className="w-10 h-10 text-emerald-400" />
                                <motion.div 
                                    className="absolute -inset-2 border-2 border-dashed border-emerald-500/30 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear'}}
                                />
                            </div>
                            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-black">{peers} Peers Linked</span>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
             <div className="p-6 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-2 group shadow-inner">
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</span>
                <div className="flex items-baseline gap-2">
                   <span className={`text-xl font-black ${text} font-mono tracking-tighter capitalize`}>
                     {status}
                   </span>
                </div>
             </div>
             <div className="p-6 bg-black/40 rounded-[1.5rem] border border-white/5 space-y-2 group shadow-inner">
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">Network</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-xl font-black text-white font-mono tracking-tighter">WLAN0</span>
                </div>
             </div>
         </div>
    </div>
  );
};

export default AbletonLinkManager;
