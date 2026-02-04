
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Signal, Sparkles, Brain, Cpu, Activity, 
  ShieldCheck, LayoutGrid, Layers, Loader2,
  ChevronRight, ChevronLeft, BarChart3, Command, Terminal as TerminalIcon,
  Server, Grid, X, MessageSquare
} from 'lucide-react';
import { NodeType, NodeTelemetry, MinimaNodeStatus, SequencerState, DrumTrack, Clip } from './types';
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
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeView, setActiveView] = useState<'sequencer' | 'infrastructure'>('sequencer');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false); 
  const [pcieGen, setPcieGen] = useState(3);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSingleNodeMode, setIsSingleNodeMode] = useState(true);
  
  const [sequencerState, setSequencerState] = useState<SequencerState>({
    isPlaying: false,
    bpm: 124,
    rootNote: 'C',
    scale: 'Minor',
    timeSignature: { beats: 4, subdivision: 4 },
    tracks: INITIAL_DRUM_TRACKS
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const multiNodeData: NodeTelemetry[] = [
    { id: 'FX-01', type: NodeType.NEBULA, cpuTemp: 41.2, cpuLoad: 18, ramUsage: 8.4, npuTops: 22.5, storageUsage: 12, fanRpm: 2100, coolingStatus: 'optimal', status: 'online' },
    { id: 'FX-02', type: NodeType.PULSE, cpuTemp: 44.5, cpuLoad: 42, ramUsage: 10.1, npuTops: 18.2, storageUsage: 74, fanRpm: 2800, coolingStatus: 'optimal', status: 'online' },
    { id: 'FX-03', type: NodeType.BRAIN, cpuTemp: 38.9, cpuLoad: 14, ramUsage: 5.2, npuTops: 4.1, storageUsage: 38, fanRpm: 1600, coolingStatus: 'optimal', status: 'online' }
  ];

  const singleNodeData: NodeTelemetry = { id: 'FX-Core', type: NodeType.BRAIN, cpuTemp: 55.1, cpuLoad: 68, ramUsage: 12.6, npuTops: 40.7, storageUsage: 45, fanRpm: 3500, coolingStatus: 'optimal', status: 'online' };

  const [nodes, setNodes] = useState<NodeTelemetry[]>(isSingleNodeMode ? [singleNodeData] : multiNodeData);
  const [minima, setMinima] = useState<MinimaNodeStatus>({ blockHeight: 1442188, walletBalance: 421.12, peers: 14, licenseVerified: false, provenanceHash: "0x882A...91F2" });

  useEffect(() => {
    setNodes(isSingleNodeMode ? [singleNodeData] : multiNodeData);
  }, [isSingleNodeMode]);

  useEffect(() => {
    setIsBroadcasting(sequencerState.isPlaying);
  }, [sequencerState.isPlaying]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatHistory]);

  const processDirectives = useCallback((calls: any[]) => {
    setSequencerState(prev => {
        let newState = JSON.parse(JSON.stringify(prev));
        calls.forEach(call => {
            const trackIdx = newState.tracks.findIndex((t: DrumTrack) => t.id === call.args.trackId);
            if (trackIdx === -1 && call.name !== 'updateSequencer') return;

            if (call.name === 'updateSequencer') {
                if (call.args.bpm) newState.bpm = Math.max(40, Math.min(300, call.args.bpm));
            } else if (call.name === 'adjustTrack') {
                const { volume, mute, solo } = call.args;
                if (volume !== undefined) newState.tracks[trackIdx].volume = volume;
                if (mute !== undefined) newState.tracks[trackIdx].mute = mute;
                if (solo !== undefined) newState.tracks[trackIdx].solo = solo;
            } else if (call.name === 'manageClip') {
                const { action, clipIndex } = call.args;
                const track = newState.tracks[trackIdx];
                switch(action) {
                    case 'launch':
                        if (clipIndex < track.clips.length) track.activeClipIndex = clipIndex;
                        break;
                    case 'create':
                        if (track.clips.length < 4) {
                            const newClip: Clip = { id: `clip_${Math.random()}`, steps: Array(16).fill(false), velocities: Array(16).fill(0.8), probabilities: Array(16).fill(1), pitches: Array(16).fill(12), length: 16, timeSignature: prev.timeSignature };
                            track.clips.push(newClip);
                            track.activeClipIndex = track.clips.length - 1;
                        }
                        break;
                    case 'duplicate':
                        if (track.clips.length < 4 && clipIndex < track.clips.length) {
                           const clipToDup = JSON.parse(JSON.stringify(track.clips[clipIndex]));
                           clipToDup.id = `clip_${Math.random()}`;
                           track.clips.push(clipToDup);
                        }
                        break;
                    case 'clear':
                         if (clipIndex < track.clips.length) {
                            track.clips[clipIndex].steps = Array(16).fill(false);
                         }
                        break;
                }
            }
        });
        return newState;
    });
}, []);


  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isQuerying) return;
    const userMsg = prompt;
    setPrompt('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsQuerying(true);
    
    const result = await askArchitect(userMsg, sequencerState, isSingleNodeMode);
    
    if (result.functionCalls && result.functionCalls.length > 0) {
      processDirectives(result.functionCalls);
    }
    
    setChatHistory(prev => [...prev, { role: 'assistant', text: result.text }]);
    setIsQuerying(false);
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#0D1117] font-sans text-gray-300 selection:bg-emerald-500/30 relative`}>
      <div className="scanline" />
      <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      <aside className="fixed bottom-0 left-0 w-full h-16 lg:relative lg:w-20 lg:h-screen shrink-0 flex flex-row lg:flex-col items-center justify-around lg:justify-start lg:py-8 lg:gap-10 bg-black border-t lg:border-t-0 lg:border-r border-white/10 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="hidden lg:block p-3 bg-emerald-500 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-all active:scale-95">
          <Music className="text-black w-6 h-6" />
        </div>
        <nav className="flex flex-row lg:flex-col gap-6 items-center">
          <button onClick={() => setActiveView('sequencer')} className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${activeView === 'sequencer' ? 'bg-white/10 text-emerald-400 border border-emerald-500/20 shadow-xl' : 'text-gray-700 hover:text-white hover:bg-white/5'}`}>
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveView('infrastructure')} className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${activeView === 'infrastructure' ? 'bg-white/10 text-cyan-400 border border-cyan-500/20 shadow-xl' : 'text-gray-700 hover:text-white hover:bg-white/5'}`}>
            <Layers className="w-6 h-6" />
          </button>
          {isMobile && (
            <button onClick={() => setIsChatExpanded(true)} className={`p-3 rounded-xl transition-all ${isChatExpanded ? 'text-emerald-400 bg-white/10' : 'text-gray-700 hover:text-emerald-400'}`}>
              <MessageSquare className="w-6 h-6" />
            </button>
          )}
        </nav>
        <div className="hidden lg:flex mt-auto flex-col gap-6">
          <button onClick={() => setIsShortcutsOpen(true)} className="p-4 rounded-2xl text-gray-800 hover:text-white active:scale-90 transition-transform"><Command className="w-6 h-6" /></button>
          <div className={`p-4 rounded-2xl border transition-all ${isBroadcasting ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-gray-800 border-transparent'}`}><Signal className={`w-6 h-6 ${isBroadcasting ? 'animate-pulse' : ''}`} /></div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 lg:h-20 shrink-0 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-black/40 backdrop-blur-3xl z-50">
          <div className="flex flex-col">
            <h1 className="text-base lg:text-xl font-black uppercase tracking-[0.25em] text-white">LyraFlex <span className="text-emerald-400">CONSOLE PRO</span></h1>
            <span className="text-[8px] lg:text-[9px] font-mono uppercase tracking-[0.5em] text-gray-500 mt-1">Reflex x Infinity // Kilele 2026</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[8px] uppercase font-bold text-gray-600 tracking-widest">Hardware Engine</span>
             </div>
             <div className="flex gap-0.5 lg:gap-1 p-1 bg-black/60 rounded-xl border border-white/10 scale-90 lg:scale-100 origin-right">
                <button onClick={() => setIsSingleNodeMode(true)} className={`px-2 lg:px-3 py-1 rounded-lg flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs transition-all ${isSingleNodeMode ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-600 hover:text-gray-400'}`}>
                   <Server className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Single
                </button>
                <button onClick={() => setIsSingleNodeMode(false)} className={`px-2 lg:px-3 py-1 rounded-lg flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs transition-all ${!isSingleNodeMode ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-600 hover:text-gray-400'}`}>
                   <Grid className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Cluster
                </button>
             </div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 lg:p-10 custom-scrollbar pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            {activeView === 'sequencer' ? (
              <motion.div key="seq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col xl:grid xl:grid-cols-12 xl:gap-10">
                <div className="xl:col-span-8 2xl:col-span-9 space-y-6 lg:space-y-10">
                  <DrumMachine externalState={sequencerState} onStateChange={setSequencerState} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    <PCIeLaneManager currentGen={pcieGen} onGenChange={setPcieGen} />
                    <MonetizationPanel onMint={(h) => setChatHistory(prev => [...prev, { role: 'assistant', text: `Registry Success. Session Hash: ${h}` }])} />
                  </div>
                </div>

                <div className="mt-6 xl:mt-0 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6 lg:gap-10">
                  <div className="glass-panel p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 space-y-8 shadow-xl">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-fuchsia-400" /> {isSingleNodeMode ? 'Core Telemetry' : 'Mesh Telemetry'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 lg:gap-6">
                      {nodes.map(node => <TelemetryNode key={node.id} data={node} isSingleNode={isSingleNodeMode} />)}
                    </div>
                  </div>
                  
                  <MinimaStatus status={minima} isVerified={isNebulaAuthenticated} onVerify={() => setIsNebulaAuthenticated(true)} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="infra" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <DeploymentTerminal />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {(isChatExpanded || !isMobile) && (
          <motion.aside 
            initial={isMobile ? { x: '100%' } : { width: isChatExpanded ? 480 : 64 }}
            animate={isMobile ? { x: 0 } : { width: isChatExpanded ? 480 : 64 }}
            exit={isMobile ? { x: '100%' } : {}}
            className={`fixed inset-0 lg:relative lg:inset-auto z-[200] lg:z-50 flex flex-col border-l border-white/5 bg-[#010409] transition-all duration-500 shadow-[-20px_0_60px_rgba(0,0,0,0.6)]`}
          >
            {!isMobile && (
              <button onClick={() => setIsChatExpanded(!isChatExpanded)} className="absolute -left-5 top-24 z-[210] p-2.5 bg-emerald-500 text-black rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95">
                {isChatExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            )}

            {isMobile && (
              <button onClick={() => setIsChatExpanded(false)} className="absolute top-6 right-6 z-[210] p-3 bg-white/5 text-white rounded-xl active:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}

            {(!isChatExpanded && !isMobile) ? (
              <div className="flex flex-col items-center py-10 gap-12 opacity-20 hover:opacity-100 transition-opacity cursor-pointer h-full" onClick={() => setIsChatExpanded(true)}>
                 <Brain className="w-6 h-6 text-emerald-500" />
                 <div className="h-[1px] w-6 bg-white/10" />
                 <span className="[writing-mode:vertical-lr] font-mono text-[10px] font-black uppercase tracking-[0.6em] rotate-180 text-emerald-400">Neural Bridge</span>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="px-6 lg:px-10 py-6 lg:py-10 border-b border-white/5 shrink-0 bg-black/20">
                  <div className="flex items-center gap-5">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                        <Brain className={`w-6 lg:w-7 h-6 lg:h-7 text-emerald-400 ${isQuerying ? 'animate-pulse' : ''}`} />
                     </div>
                     <div>
                        <h3 className="text-xs lg:text-sm font-black uppercase tracking-[0.25em] text-white">Neural Co-Producer</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                          <p className="text-[8px] lg:text-[10px] font-mono text-cyan-500 uppercase font-bold tracking-widest">AIR_LLM // NATIVE_ENGINE</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 lg:p-10 space-y-6 lg:space-y-10 custom-scrollbar bg-black/40">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-8 grayscale px-6">
                       <div className="p-6 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-2xl">
                          <Sparkles className="w-12 lg:w-16 h-12 lg:h-16 text-emerald-500" />
                       </div>
                       <p className="text-[10px] lg:text-[11px] font-mono uppercase tracking-[0.4em] leading-relaxed text-gray-500">
                         Bridge online. I can manage hardware presets. Ask me to "optimize bus lanes" or "transpose sequences".
                       </p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-4 lg:p-6 rounded-2xl lg:rounded-[1.8rem] text-[11px] lg:text-[12px] font-mono leading-relaxed shadow-2xl border ${msg.role === 'user' ? 'bg-emerald-500 text-black font-black border-emerald-400' : 'bg-white/[0.03] text-gray-300 border-white/10 backdrop-blur-3xl'}`}>
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

                <div className="p-6 lg:p-10 bg-[#0a0a0a] border-t border-white/10 shrink-0 mb-4 lg:mb-0">
                  <form onSubmit={handleQuery} className="relative group">
                    <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="NEURAL COMMAND..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl lg:rounded-2xl px-5 lg:px-7 py-4 lg:py-6 pr-14 lg:pr-16 text-[10px] lg:text-xs focus:outline-none focus:border-emerald-500/50 text-white font-mono uppercase tracking-widest transition-all shadow-inner" />
                    <button disabled={isQuerying} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 lg:p-3.5 bg-emerald-500 text-black rounded-lg lg:rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-20 shadow-lg active:scale-95">
                      {isQuerying ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <TerminalIcon className="w-4 h-4 lg:w-5 lg:h-5" />}
                    </button>
                  </form>
                  <div className="hidden lg:flex justify-between items-center mt-6 text-[8px] font-mono uppercase text-gray-600 tracking-[0.3em] font-black">
                     <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5"/> NPU_INFERENCE_READY</span>
                     <span>Reflex x Minima // Kilele 2026</span>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
