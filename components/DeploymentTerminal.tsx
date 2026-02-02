
import React, { useState } from 'react';
import { Terminal, Shield, Zap, Database, Music, Cpu, Settings, Code, Radio, Monitor, CloudLightning } from 'lucide-react';

const DeploymentTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'common' | 'audio' | 'ai' | 'broadcast' | 'daw' | 'air'>('common');

  const content = {
    common: {
      title: "common.yml (Base Provisioning)",
      description: "Applies RT-Kernel, PCIe Gen 3, and Minima services.",
      code: `- name: Reflex Base Setup
  hosts: reflex_cluster
  tasks:
    - name: Install Headless Dependencies
      apt:
        name: 
          - xvfb
          - libsndfile1-dev
          - pulseaudio-utils
        state: present`
    },
    audio: {
      title: "audio.yml (PipeWire Bonding)",
      description: "Advanced Native-Protocol-TCP bonding with 0.8ms buffer targets.",
      code: `context.modules = [
  { name = libpipewire-module-protocol-native
    args = { 
      address = [ "tcp:10.0.0.3:4713" ]
      native.latency = "32/48000" 
    }
  }
]`
    },
    ai: {
      title: "ai.yml (Neural Inference)",
      description: "Deploying Hailo Dataflow Compiler and TAPPAS.",
      code: `- name: Load RAVE .hef model to NPU
  copy:
    src: models/rave_synth_v4.hef
    dest: /opt/reflex/models/`
    },
    broadcast: {
      title: "broadcast.yml (FM Transmitter)",
      description: "Compiling and installing the PiFM RDS toolchain.",
      code: `- name: Install FM Transmitter
  hosts: brain
  tasks:
    - name: Clone Pi-FM-RDS
      git:
        repo: 'https://github.com/ChristopheJacquet/PiFmRds.git'
        dest: /tmp/pifmrds`
    },
    daw: {
      title: "daw.yml (LMMS Orchestration)",
      description: "Configuring headless LMMS with ZynAddSubFX for pattern rendering.",
      code: `- name: Provision Open-Source DAW
  hosts: nebula_pulse
  tasks:
    - name: Install LMMS Core
      apt:
        name: 
          - lmms
          - zynaddsubfx`
    },
    air: {
      title: "air_llm.yml (Local AI)",
      description: "Orchestrating local Air LLM instances for offline RPi assistance.",
      code: `- name: Setup Local Air LLM
  hosts: fx_nodes
  tasks:
    - name: Install Python AI Deps
      pip:
        name: [ "air-llm", "transformers", "torch" ]
    
    - name: Start Local Model Server
      shell: air-llm run mistral-7b-v0.1 --device rpi-npu`
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full rounded-lg overflow-hidden border border-white/10">
      <div className="flex bg-white/5 border-b border-white/10 overflow-x-auto no-scrollbar">
        {(Object.keys(content) as Array<keyof typeof content>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === key ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {key === 'broadcast' && <Radio className="w-3 h-3" />}
            {key === 'daw' && <Monitor className="w-3 h-3" />}
            {key === 'common' && <Settings className="w-3 h-3" />}
            {key === 'audio' && <Music className="w-3 h-3" />}
            {key === 'ai' && <Cpu className="w-3 h-3" />}
            {key === 'air' && <CloudLightning className="w-3 h-3" />}
            {key.toUpperCase().replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="p-5 flex-grow overflow-auto bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-4 h-4 text-cyan-500" />
          <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest">{content[activeTab].title}</h4>
        </div>
        <p className="text-[10px] text-gray-500 mb-5 font-mono leading-relaxed border-l-2 border-white/5 pl-3">
          {content[activeTab].description}
        </p>
        <div className="relative group">
           <pre className="text-[11px] font-mono text-cyan-50/70 leading-relaxed bg-black/60 p-5 rounded border border-white/5 select-all overflow-x-auto">
            {content[activeTab].code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DeploymentTerminal;
