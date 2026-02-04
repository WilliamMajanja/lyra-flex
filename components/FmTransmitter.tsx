
import React, { useState, useEffect } from 'react';
import { Radio, Power, Signal, SlidersHorizontal, MicVocal } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onStateChange: (isBroadcasting: boolean) => void;
}

const FmTransmitter: React.FC<Props> = ({ onStateChange }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [frequency, setFrequency] = useState(101.1);
  const [ps, setPs] = useState("REFLEX");
  const [rt, setRt] = useState("KILELE_FESTIVAL_LIVE");

  useEffect(() => {
    onStateChange(isBroadcasting);
  }, [isBroadcasting, onStateChange]);

  const handleToggle = () => setIsBroadcasting(!isBroadcasting);
  
  const color = isBroadcasting ? 'red' : 'gray';
  const text = isBroadcasting ? 'text-red-400' : 'text-gray-600';
  const border = isBroadcasting ? 'border-red-500/20' : 'border-gray-500/20';
  const bg = isBroadcasting ? 'bg-red-500/10' : 'bg-gray-500/10';


  return (
    <div className="glass-panel p-8 rounded-[2rem] border border-white/5 space-y-8 flex flex-col justify-between shadow-xl relative overflow-hidden h-full">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/20 to-transparent`} />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
           <div className={`p-3 ${bg} rounded-2xl ${border} shadow-lg`}>
              <Radio className={`w-6 h-6 ${text} ${isBroadcasting ? 'animate-pulse' : ''}`} />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">FM Transmitter</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase mt-1 tracking-widest font-bold">GPIO Broadcast Signal</p>
           </div>
        </div>
        <button
          onClick={handleToggle}
          className={`p-2.5 rounded-full transition-all ${isBroadcasting ? `bg-${color}-500 text-black shadow-lg shadow-red-500/20` : 'bg-black/60 text-gray-600 hover:bg-white/5'}`}
        >
          <Power className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-2">
        <input 
          type="range" 
          min="88.0" 
          max="108.0" 
          step="0.1" 
          value={frequency} 
          onChange={(e) => setFrequency(parseFloat(e.target.value))}
          disabled={!isBroadcasting}
          className={`w-full accent-red-500 cursor-pointer transition-opacity ${isBroadcasting ? 'opacity-100' : 'opacity-20'}`}
        />
        <div className="text-center">
            <span className={`text-4xl font-black font-mono transition-colors ${isBroadcasting ? 'text-white' : 'text-gray-700'}`}>{frequency.toFixed(1)}</span>
            <span className={`text-sm font-mono transition-colors ${isBroadcasting ? 'text-red-400' : 'text-gray-800'}`}> MHz</span>
        </div>
        {isBroadcasting && (
            <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity}}
                className={`mt-2 flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">ON AIR</span>
            </motion.div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
            <label className="text-[8px] font-mono uppercase text-gray-500 tracking-widest">Program Service (PS)</label>
            <input 
                type="text" 
                value={ps}
                onChange={(e) => setPs(e.target.value.substring(0, 8).toUpperCase())}
                disabled={!isBroadcasting}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-red-500/50 disabled:opacity-30"
            />
        </div>
        <div>
            <label className="text-[8px] font-mono uppercase text-gray-500 tracking-widest">Radio Text (RT)</label>
            <input 
                type="text" 
                value={rt}
                onChange={(e) => setRt(e.target.value.substring(0, 64).toUpperCase())}
                disabled={!isBroadcasting}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-red-500/50 disabled:opacity-30"
            />
        </div>
      </div>
    </div>
  );
};

export default FmTransmitter;
