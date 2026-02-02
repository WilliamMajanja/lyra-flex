# LyraFlex PRO (Aura Trinity Cluster) 🎸🔊

### The World's First AI-Native, Decentralized Audio Workstation
**LyraFlex PRO** is a high-fidelity performance environment built on the **Aura Trinity** systems architecture. Designed for the **Kilele 2026 Initiative**, it transforms a cluster of Raspberry Pi 5s into a context-aware neural audio suite that bridges the gap between raw hardware telemetry and creative synthesis.

---

## 💎 Core Architectural Pillars

### 1. Neural Co-Producer (Gemini 3 Pro)
The workstation features a deep integration with Google's Gemini 3 Pro model. Unlike standard chat assistants, the **Neural Co-Producer** is "DAW-Aware":
- **Contextual Analysis**: It reads your sequencer's active steps, BPM, and mastering levels in real-time.
- **Neural Directives**: It provides actionable production advice (e.g., "Increase Kick_808 saturation to 0.75 and shift engine to Mixxx for better transient response").
- **Hardware Optimization**: Advises on RPi 5 core affinity and PCIe Gen 3 bus lane configuration.

### 2. Obsidian Studio UI
A high-precision, 3-column ergonomic workspace designed for live performance:
- **Global Nav Rail**: Rapid access between the Performance Deck and Infrastructure Management.
- **Central Workspace**: 16-step high-fidelity sequencer with per-track gain, polymetric end-points, and NPU target routing.
- **Neural Deck**: A reactive command center for instruction-based production and system diagnostics.

### 3. Pro Mastering & Synthesis
- **High-Fidelity Engine**: Custom multi-stage synthesis (exponential pitch sweeps for kicks, resonant noise for snares).
- **Mastering Chain**: Integrated Limiter, Saturation (Valve Drive), Stereo Imager, and Neural Air (EQ) directly influencing the Web Audio graph.
- **Low Latency**: Optimized for 0.8ms I/O parity using PipeWire native protocols.

---

## 🏗 Distributed Hardware Layout
| Node | Code | Role | Engine |
| :--- | :--- | :--- | :--- |
| **FX-01** | The Nebula | Neural Timbre & Pad Synth | ZynAddSubFX / AirLLM |
| **FX-02** | The Pulse | Rhythmic Micro-Sequences | LMMS / Mixxx |
| **FX-03** | The Brain | Master Mixing & FM TX | PipeWire / PiFmRds |

---

## 💰 Monetization & Provenance
LyraFlex PRO automates the transition from "Live Show" to "Digital Asset" via the **Minima Blockchain**:
1. **Direct Master Capture**: Lossless recording directly to NVMe.
2. **Blockchain Verification**: Automatic minting of performance hashes for copyright protection.
3. **Asset Export**: Package mastered STEMS and session metadata with one-click decentralized registry.

---

## 🛠 Tech Stack & Dependencies
- **AI Core**: Gemini 3 Pro (via @google/genai)
- **Frontend**: React 19, Tailwind CSS, Framer Motion
- **Audio**: Web Audio API (Native Node Graph)
- **Infrastructure**: Minima (Blockchain), Hailo-8 (NPU Emulation), RPi 5 (Target Hardware)

---

## 🚀 Getting Started
1. **Initialize Cluster**: Ensure all RPi nodes are on the same subnet with RT-Kernels active.
2. **Launch NPU Bridge**: Instruct the Neural Co-Producer to "Calibrate PCIe Lanes" for optimal bus speed.
3. **Perform**: Start the sequencer and use **Neural Directives** to evolve your sound.

---

## 📄 License
MIT © 2025 LyraFlex Performance Labs. Official Project of the Kilele 2026 Developer Initiative. Supported by the Infinity Collaborations Student Developer Hub.