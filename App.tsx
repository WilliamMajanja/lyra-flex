
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Radio, Signal, Sparkles, Brain, Cpu, Activity, 
  Database, ShieldCheck, Zap, LayoutGrid, Layers, Loader2,
  ChevronRight, ChevronLeft, BarChart3, Command
} from 'lucide-react';
import { NodeType, NodeTelemetry, MinimaNodeStatus, SequencerState } from './types';
import TelemetryNode from './components/TelemetryNode';
import DeploymentTerminal from './components/DeploymentTerminal';
import MinimaStatus from './components/MinimaStatus';
import MonetizationPanel from './components/MonetizationPanel';
import PCIeLaneManager from './components/PCIeLaneManager';
import DrumMachine from './components/DrumMachine';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { askArchitect } from './services/geminiService';
import { INITIAL_DRUM_TRACKS } from './constants';

const App: React.FC = () => {
  const [isNebulaAuthenticated, setIsNebulaAuthenticated] = useState(false);
  const [fmFrequency, setFmFrequency] = useState(101.1);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [pcieGen, setPcieGen] = useState(3);
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeView, setActiveView] = useState<'sequencer' | 'infrastructure'>('sequencer');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  
  const [sequencerState, setSequencerState] = useState<SequencerState>({
    isPlaying: false,
    bpm: 124,
    currentSteps: Array(INITIAL_DRUM_TRACKS.length).fill(0),
    tracks: INITIAL_DRUM_TRACKS
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodeTelemetry[]>([
    { id: 'FX-01', type: NodeType.NEBULA, cpuTemp: 41.2, cpuLoad: 18, ramUsage: 8.4, npuTops: 22.5, storageUsage: 12, fanRpm: 2100, coolingStatus: 'optimal', status: 'online' },
    { id: 'FX-02', type: NodeType.PULSE, cpuTemp: 44.5, cpuLoad: 42, ramUsage: 10.1, npuTops: 18.2, storageUsage: 74, fanRpm: 2800, coolingStatus: 'optimal', status: 'online' },
    { id: 'FX-03', type: NodeType.BRAIN, cpuTemp: 38.9, cpuLoad: 14, ramUsage: 5.2, npuTops: 4.1, storageUsage: 38, fanRpm: 1600, coolingStatus: 'optimal', status: 'online' }
  ]);

  const [minima, setMinima] = useState<MinimaNodeStatus>({
    blockHeight: 1442188,
    walletBalance: 421.12,
    peers: 14,
    licenseVerified: true,
    provenanceHash: "0x882A...91F2"
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        cpuTemp: Math.max(35, Math.min(85, node.cpuTemp + (Math.random() - 0.5) * (sequencerState.isPlaying ? 4 : 1))),
        cpuLoad: Math.max(10, Math.min(100, node.cpuLoad + (Math.random() - 0.5) * (sequencerState.isPlaying ? 15 : 5))),
      })));
      setMinima(prev => ({
        ...prev,
        blockHeight: prev.blockHeight + (Math.random() > 0.95 ? 1 : 0),
        walletBalance: prev.walletBalance + (Math.random() * 0.0006)
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [sequencerState.isPlaying]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatHistory]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isQuerying) return;
    const userMsg = prompt;
    setPrompt('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsQuerying(true);
    const response = await askArchitect(userMsg, sequencerState);
    setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
    setIsQuerying(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020202] font-sans text-gray-400 selection:bg-emerald-500/30">
      <div className="scanline" />
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* 1. Global Navigation Rail */}
      <aside className="w-20 shrink-0 flex flex-col items-center py-8 gap-10 bg-black border-r border-white/5 z-50">
        <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-all">
          <Music className="text-black w-6 h-6" />
        </div>
        
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveView('sequencer')}
            className={`p-4 rounded-2xl transition-all ${activeView === 'sequencer' ? 'bg-white/10 text-emerald-400 shadow-xl border border-emerald-500/20' : 'text-gray-700 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setActiveView('infrastructure')}
            className={`p-4 rounded-2xl transition-all ${activeView === 'infrastructure' ? 'bg-white/10 text-cyan-400 shadow-xl border border-cyan-500/20' : 'text-gray-700 hover:text-white hover:bg-white/5'}`}
          >
            <Layers className="w-6 h-6" />
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <button onClick={() => setIsShortcutsOpen(true)} className="p-4 rounded-2xl text-gray-800 hover:text-white">
            <Command className="w-6 h-6" />
          </button>
          <div className={`p-4 rounded-2xl border transition-all ${isBroadcasting ? 'text-red-500 border-red-500/30 bg-red-500/5 shadow-inner' : 'text-gray-800 border-transparent'}`}>
            <Signal className={`w-6 h-6 ${isBroadcasting ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 shrink-0 flex items-center justify-between px-10 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-[0.25em] text-white">
              LyraFlex <span className="text-emerald-400">PRO</span>
            </h1>
            <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-gray-700 mt-1">RT-Kernel Mesh // v0.4.2</span>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4 bg-black/60 px-5 py-2.5 rounded-2xl border border-white/10 shadow-inner">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black font-mono text-white tracking-widest uppercase">#{minima.blockHeight}</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-mono text-gray-600 uppercase tracking-widest font-black">
               <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${sequencerState.isPlaying ? 'bg-emerald-500 shadow-lg animate-pulse' : 'bg-gray-800'}`} />
                  <span className={sequencerState.isPlaying ? 'text-emerald-500' : ''}>Sync: Active</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-gray-800 uppercase font-bold">I/O:</span>
                  <span className="text-cyan-400 font-black">0.8ms</span>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeView === 'sequencer' ? (
              <motion.div 
                key="seq" 
                initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }}
                className="grid grid-cols-12 gap-10 h-full"
              >
                <div className="col-span-12 xl:col-span-9 space-y-10">
                  <DrumMachine externalState={sequencerState} onStateChange={setSequencerState} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
                    <PCIeLaneManager currentGen={pcieGen} onGenChange={setPcieGen} />
                    <MonetizationPanel onMint={(h) => setChatHistory(prev => [...prev, { role: 'assistant', text: `Registry Success. Session Hash: ${h}` }])} />
                  </div>
                </div>

                <div className="col-span-12 xl:col-span-3 space-y-10">
                  <div className="glass-panel p-6 rounded-[2.5rem] border border-white/5 space-y-8 shadow-xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-fuchsia-400" /> Cluster Metrics
                    </h3>
                    <div className="space-y-6">
                      {nodes.map(node => <TelemetryNode key={node.id} data={node} />)}
                    </div>
                  </div>
                  <MinimaStatus status={minima} isVerified={isNebulaAuthenticated} onVerify={() => setIsNebulaAuthenticated(true)} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="infra"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <DeploymentTerminal />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. Neural Command Deck (Right Drawer) */}
      <aside className={`relative flex flex-col border-l border-white/5 bg-[#050505] transition-all duration-500 ease-in-out shadow-[-20px_0_60px_rgba(0,0,0,0.6)] ${isChatExpanded ? 'w-[480px]' : 'w-16'}`}>
        <button 
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="absolute -left-5 top-24 z-50 p-2.5 bg-emerald-500 text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform"
        >
          {isChatExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {!isChatExpanded ? (
          <div className="flex flex-col items-center py-10 gap-12 opacity-20 hover:opacity-100 transition-opacity">
             <Brain className="w-6 h-6 text-emerald-500" />
             <div className="h-[1px] w-6 bg-white/10" />
             <span className="[writing-mode:vertical-lr] font-mono text-[10px] font-black uppercase tracking-[0.6em] rotate-180 text-emerald-400">Neural Bridge</span>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-10 py-10 border-b border-white/5 shrink-0 bg-black/20">
              <div className="flex items-center gap-5">
                 <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                    <Brain className={`w-7 h-7 text-emerald-400 ${isQuerying ? 'animate-pulse' : ''}`} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">Neural Co-Producer</h3>
                    <p className="text-[10px] font-mono text-gray-700 uppercase mt-1 font-bold tracking-widest">GEMINI_3_PRO_NATIVE</p>
                 </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar bg-black/40">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-8 grayscale px-12">
                   <div className="p-8 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-2xl">
                      <Sparkles className="w-16 h-16 text-emerald-500" />
                   </div>
                   <p className="text-[11px] font-mono uppercase tracking-[0.4em] leading-relaxed text-gray-500">
                     Bridge online. I am monitoring your sequencer state and telemetry cluster. Ask for a mix review or hardware optimization.
                   </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] p-6 rounded-[1.8rem] text-[12px] font-mono leading-relaxed shadow-2xl border ${msg.role === 'user' ? 'bg-emerald-500 text-black font-black border-emerald-400' : 'bg-white/[0.03] text-gray-300 border-white/10 backdrop-blur-3xl'}`}>
                    {msg.text.split('\n').map((line, idx) => (
                      <span key={idx} className={line.startsWith('DIRECTIVE:') ? 'text-emerald-400 font-bold block mt-4 border-t border-emerald-500/10 pt-2' : ''}>
                        {line}<br/>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-10 bg-[#0a0a0a] border-t border-white/10 shrink-0">
              <form onSubmit={handleQuery} className="relative group">
                <input 
                  type="text" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="ASK THE ARCHITECT..." 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-7 py-6 pr-16 text-xs focus:outline-none focus:border-emerald-500/50 text-white font-mono uppercase tracking-widest transition-all" 
                />
                <button 
                  disabled={isQuerying}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-20 shadow-lg active:scale-95"
                >
                  {isQuerying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                </button>
              </form>
              <div className="flex justify-between items-center mt-6 text-[8px] font-mono uppercase text-gray-800 tracking-[0.3em] font-black">
                 <span>Inference Ready</span>
                 <span>Kilele 2026</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default App;
