
# LyraFlex | Kilele Festival 2026 🎸🔊

### The World's First AI-Native Performance Workstation
**LyraFlex** is a high-fidelity performance environment built as an installation for the **Kilele Festival 2026**. This project is a flagship collaboration engineered by **Infinity Collaborations**, **Minima**, and **Reflex**.

---

## 💎 Core Architectural Pillars

### 1. Built on Reflex
LyraFlex is powered by the **Reflex** systems architecture, designed for ultra-low latency audio processing on edge hardware:
- **RT-Kernel Mesh**: Synchronized real-time kernels across a cluster of Raspberry Pi 5 nodes.
- **Neural Co-Producer**: Deeply integrated Gemini 3 Pro model acting as a DAW-aware performance assistant.
- **Hardware Optimization**: Native PCIe Gen 3 bus lane configuration for maximum data throughput.

### 2. Blockchain Powered by Minima
All performance integrity, identity verification, and asset provenance are handled natively on-chain:
- **Decentralized Registry**: Every performance capture is hashed and recorded on the Minima protocol.
- **Smart Contract Auth**: Secure workstation licensing and access control via Minima-powered contracts.
- **Provenance Tracking**: Lossless STEMS are automatically minted with provenance metadata for copyright protection.

### 3. Installation For Kilele Festival
Specifically tuned for the **Kilele Festival 2026** by **Infinity Collaborations**:
- **Obsidian Studio UI**: A high-precision, 3-column ergonomic workspace designed for live performance environments.
- **Multi-Node Synthesis**: Distributed synthesis engines across Nebula, Pulse, and Brain nodes.
- **Direct Master Capture**: Seamless recording and mastering suite integrated into the performance flow.

---

## 🏗 Hardware Configurations

LyraFlex supports two primary hardware configurations.

### A) Single Node Configuration (Default)
For maximum accessibility, LyraFlex can run in an integrated mode on a single, powerful Raspberry Pi 5.
- **FX-Core**: A single RPi 5 handles all roles: synthesis, sequencing, mixing, and transmission. This is the recommended setup for most users and developers.

### B) Distributed 3-Node Cluster
For maximum performance and hardware separation, the original 3-node mesh provides dedicated resources for each core task.
| Node | Code | Role | Engine |
| :--- | :--- | :--- | :--- |
| **FX-01** | The Nebula | Neural Timbre & Pad Synth | ZynAddSubFX / AirLLM |
| **FX-02** | The Pulse | Rhythmic Micro-Sequences | LMMS / Mixxx |
| **FX-03** | The Brain | Master Mixing & FM TX | PipeWire / PiFmRds |


---

## 🛠 Tech Stack & Dependencies
- **AI Core**: Gemini 3 Pro (via @google/genai)
- **Blockchain**: Minima (Native Node Integration)
- **Frontend**: React 19, Tailwind CSS, Framer Motion
- **Audio**: Web Audio API (Native Node Graph)
- **Infrastructure**: Reflex Framework on RPi 5 (Target Hardware)

---

## 🚀 Festival Activation
1. **Initialize Cluster**: Ensure all RPi nodes are on the Reflex mesh subnet with RT-Kernels active.
2. **Launch NPU Bridge**: Instruct the Neural Co-Producer to "Calibrate PCIe Lanes" for optimal bus speed.
3. **Perform**: Start the sequencer and use **Neural Directives** to evolve your sound live.

---

## 📄 Credits
Built by **Infinity Collaborations** for the **Kilele Festival 2026**.
In partnership with **Minima** and **Reflex**.
MIT © 2025 Reflex Performance Labs. Official Project of the Kilele 2026 Developer Initiative.