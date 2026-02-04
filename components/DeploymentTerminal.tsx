
import React, { useState } from 'react';
import { Terminal, HardDrive, Zap, Music, Cpu, Settings, Code, Radio, CloudLightning, Activity } from 'lucide-react';

const DeploymentTerminal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof content>('ai_core');

  const content = {
    ai_core: {
      title: "ai_core.yml (Reflex Llama Core)",
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
    },
    htop: {
        title: "htop (System Process Monitor)",
        description: "Live view of running processes on FX-Core.",
        code: `  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 2125 root       20   0 1.25G 18.5M 10.1M S  8.5  0.8 2:15.45 reflex-core-daemon
 1880 root       20   0 850M  22.1M  8.5M S  4.2  1.1 1:05.11 pipewire-pulse
 7541 user       20   0 2.5G  95.4M 35.2M S  2.1  4.5 0:45.33 air_llm_service
  998 root       19  -1  512M  4.2M   3.1M S  1.0  0.2 0:11.98 irq/63-pcie-aer
 2126 root       20   0 180M  1.5M   1.1M R  0.5  0.1 0:02.13 minima_daemon
 2230 user       20   0  320M  8.9M   4.5M S  0.3  0.4 0:01.50 ableton-link-sync`
    },
    apt: {
        title: "apt (Package Manager)",
        description: "Updating system packages and Reflex dependencies.",
        code: `> sudo apt update && sudo apt upgrade -y
Hit:1 http://deb.debian.org/debian bookworm InRelease
Hit:2 http://security.debian.org/debian-security bookworm-security InRelease
Hit:3 http://deb.debian.org/debian bookworm-updates InRelease
Get:4 https://repo.reflex-performance.dev/ stable InRelease [5,812 B]
Get:5 https://repo.minima.global/ nightly InRelease [2,450 B]
Fetched 8,262 B in 1s (7,150 B/s)
Reading package lists... Done
Building dependency tree... Done
All packages are up to date.`
    },
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
    npu_engine: {
      title: "npu_engine.yml (NPU Accelerant)",
      description: "Deploying Hailo-8 HEF models for real-time mastering.",
      code: `- name: Deploy RAVE NPU Engine
  copy:
    src: models/reflex_mastering_v2.hef
    dest: /usr/local/lib/reflex/npu/
  notify: restart_tappas_service`
    },
    fm_tx: {
      title: "fm_tx.yml (RDS Multiplex)",
      description: "Controlling the Pi-FM-RDS toolchain for the festival signal.",
      code: `pi-fm-rds \\
  -freq 101.1 \\
  -ps REFLEX \\
  -rt "KILELE_FESTIVAL_LIVE" \\
  -audio /tmp/master_stream.pcm`
    }
  };
  
  const tabsOrder: Array<keyof typeof content> = ['ai_core', 'htop', 'apt', 'npu_engine', 'audio', 'fm_tx', 'common'];
  const tabInfo: Record<keyof typeof content, { name: string; icon: React.ReactNode }> = {
      ai_core: { name: 'AI Core', icon: <CloudLightning className="w-4 h-4" /> },
      htop: { name: 'htop', icon: <Activity className="w-4 h-4" /> },
      apt: { name: 'apt', icon: <HardDrive className="w-4 h-4" /> },
      npu_engine: { name: 'NPU Engine', icon: <Zap className="w-4 h-4" /> },
      audio: { name: 'Audio', icon: <Music className="w-4 h-4" /> },
      fm_tx: { name: 'FM TX', icon: <Radio className="w-4 h-4" /> },
      common: { name: 'Common', icon: <Settings className="w-4 h-4" /> },
  };


  return (
    <div className="glass-panel flex flex-col h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex bg-white/[0.02] border-b border-white/5 overflow-x-auto no-scrollbar px-4">
        {tabsOrder.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap flex items-center gap-3 ${
              activeTab === key ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            {tabInfo[key].icon}
            {tabInfo[key].name}
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
           <pre className={`text-[12px] font-mono leading-relaxed bg-black/40 p-8 rounded-2xl border border-white/5 shadow-inner select-all overflow-x-auto ${['htop', 'apt'].includes(activeTab) ? 'text-gray-300' : 'text-cyan-100/80'}`}>
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
