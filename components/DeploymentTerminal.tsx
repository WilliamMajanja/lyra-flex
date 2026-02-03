
import React, { useState } from 'react';
import { Terminal, Shield, Zap, Database, Music, Cpu, Settings, Code, Radio, Monitor, CloudLightning, Activity } from 'lucide-react';

const DeploymentTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'common' | 'audio' | 'ai' | 'broadcast' | 'air'>('air');

  const content = {
    common: {
      title: "common.yml (System Overlord)",
      description: "Provisioning RT-Kernels for the Raspberry Pi 5 cluster.",
      code: `- name: Reflex RT-Kernel Deploy
  hosts: cluster
  tasks:
    - name: Enable PCIe Gen 3
      lineinfile:
        path: /boot/firmware/config.txt
        line: "dtparam=pciex1_gen=3"
    - name: Set CPU Governor to Performance
      shell: cpufreq-set -g performance`
    },
    audio: {
      title: "audio.yml (PipeWire Matrix)",
      description: "Synchronizing sub-millisecond buffers across Reflex nodes.",
      code: `context.properties = {
    default.clock.rate = 48000
    default.clock.quantum = 32
    default.clock.min-quantum = 16
    default.clock.max-quantum = 32
}

# Cross-node TCP Audio Bridge
protocol.native.tcp = {
    address = [ "10.0.0.1:4713" ]
}`
    },
    ai: {
      title: "ai.yml (NPU Accelerant)",
      description: "Deploying Hailo-8 HEF models for real-time mastering.",
      code: `- name: Deploy RAVE NPU Engine
  copy:
    src: models/reflex_mastering_v2.hef
    dest: /usr/local/lib/reflex/npu/
  notify: restart_tappas_service`
    },
    broadcast: {
      title: "broadcast.yml (RDS Multiplex)",
      description: "Controlling the Pi-FM-RDS toolchain for the festival signal.",
      code: `pi-fm-rds \
  -freq 101.1 \
  -ps REFLEX \
  -rt "KILELE_FESTIVAL_LIVE" \
  -audio /tmp/master_stream.pcm`
    },
    air: {
      title: "air_llm.yml (Reflex Llama Core)",
      description: "Orchestrating local 'Air LLM' free Llama instances for hardware directives.",
      code: `# Reflex Llama Optimized Deployment
- name: Initialize Air LLM Llama Native
  hosts: fx_nodes
  tasks:
    - name: Load Llama-3-8B-Reflex (4-bit quantization)
      air_llm:
        model: "llama-3-reflex-optimized"
        device: "rpi5-npu-hailo"
        max_context: 4096
        precision: int4`
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex bg-white/[0.02] border-b border-white/5 overflow-x-auto no-scrollbar px-4">
        {(Object.keys(content) as Array<keyof typeof content>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap flex items-center gap-3 ${
              activeTab === key ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            {key === 'broadcast' && <Radio className="w-4 h-4" />}
            {key === 'common' && <Settings className="w-4 h-4" />}
            {key === 'audio' && <Music className="w-4 h-4" />}
            {key === 'ai' && <Activity className="w-4 h-4" />}
            {key === 'air' && <CloudLightning className="w-4 h-4" />}
            {key.toUpperCase().replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="p-10 flex-grow overflow-auto bg-[#010409] custom-scrollbar">
        <div className="flex items-center gap-4 mb-4">
          <Terminal className="w-5 h-5 text-cyan-500" />
          <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{content[activeTab].title}</h4>
        </div>
        <p className="text-[11px] text-gray-600 mb-8 font-mono leading-relaxed border-l-2 border-cyan-500/30 pl-6 italic">
          {content[activeTab].description}
        </p>
        <div className="relative group">
           <pre className="text-[12px] font-mono text-cyan-100/80 leading-relaxed bg-black/40 p-8 rounded-2xl border border-white/5 shadow-inner select-all overflow-x-auto">
            {content[activeTab].code}
          </pre>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Code className="w-4 h-4 text-cyan-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentTerminal;