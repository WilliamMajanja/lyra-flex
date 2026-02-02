
import React, { useState } from 'react';
import { ShieldCheck, Database, Link, Wallet, Zap, Key, Lock as LockIcon, Unlock } from 'lucide-react';
import { MinimaNodeStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  status: MinimaNodeStatus;
  onVerify: () => void;
  isVerified: boolean;
}

const MinimaStatus: React.FC<Props> = ({ status, onVerify, isVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const triggerContract = () => {
    setIsVerifying(true);
    // Simulate smart contract execution time
    setTimeout(() => {
      setIsVerifying(false);
      onVerify();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-5 rounded-lg border transition-all duration-500 relative overflow-hidden group ${
        isVerified ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-amber-500/20'
      }`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Link className={`w-16 h-16 ${isVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
            Minima Blockchain Node
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className={`text-[9px] font-mono uppercase ${isVerified ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
            {isVerified ? 'Identity Verified' : 'Awaiting Auth'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-[9px] font-mono text-gray-500 uppercase flex items-center gap-1">
            <Database className="w-3 h-3" /> Block Height
          </div>
          <div className="text-xl font-black text-white font-mono tracking-tighter">
            {status.blockHeight.toLocaleString()}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-[9px] font-mono text-gray-500 uppercase flex items-center gap-1 justify-end">
             Balance <Wallet className="w-3 h-3" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono tracking-tighter">
            {status.walletBalance.toFixed(2)} WM
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-gray-500 uppercase">Contract ID</span>
          <span className="text-gray-300 truncate ml-4 max-w-[140px] font-mono">REFLEX_AUTH_V4</span>
        </div>

        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.button
              key="auth-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={triggerContract}
              disabled={isVerifying}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded flex items-center justify-center gap-2 group transition-all"
            >
              {isVerifying ? (
                <>
                  <Key className="w-3 h-3 animate-spin text-amber-400" />
                  <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Executing Contract...</span>
                </>
              ) : (
                <>
                  <LockIcon className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Run Reflex Auth Contract</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="verified-status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <Unlock className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">License Secured</span>
                <span className="text-[8px] font-mono text-emerald-500/70 uppercase">Reflex Engine: Unlocked</span>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-0.5 h-3 bg-emerald-500/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MinimaStatus;