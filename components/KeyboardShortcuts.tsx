
import React from 'react';
import { X, Keyboard, Zap, Command } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    {
      title: "Transport",
      items: [
        { key: "SPACE", action: "Toggle Play/Pause" },
        { key: "UP/DOWN", action: "Adjust BPM" },
      ]
    },
    {
      title: "Clip & Track",
      items: [
        { key: "ARROW KEYS", action: "Navigate Tracks & Clips" },
        { key: "ENTER", action: "Launch Selected Clip" },
        { key: "CMD+D", action: "Duplicate Clip" },
        { key: "BACKSPACE", action: "Delete Clip" },
      ]
    },
    {
      title: "Sequencing",
      items: [
        { key: "MOUSE CLICK", action: "Toggle Step Note" },
        { key: "V", action: "Velocity Editor" },
        { key: "P", action: "Pitch Editor" },
        { key: "B", action: "Probability Editor" },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="glass-panel w-full max-w-2xl border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]">
        <div className="px-6 py-4 bg-emerald-500/10 border-b border-emerald-500/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Command className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-200">Tactical Command Manual // FX-v5</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-b border-emerald-500/10 pb-2">
                {cat.title}
              </h3>
              <div className="space-y-4">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-[9px] font-mono text-cyan-400 min-w-[30px] text-center">
                        {item.key}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                      {item.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex items-center gap-4">
          <Zap className="w-4 h-4 text-fuchsia-500" />
          <p className="text-[9px] font-mono text-gray-500 uppercase leading-relaxed">
            Note: All triggers mapped directly to RPi 5 GPIO hardware clocks for sub-millisecond precision. Audio simulation active for native preview.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default KeyboardShortcuts;
