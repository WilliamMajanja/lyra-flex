
import { GoogleGenAI } from "@google/genai";
import { SequencerState } from "../types";

export async function askArchitect(prompt: string, state?: SequencerState) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const stateContext = state ? `
    CURRENT PERFORMANCE STATE:
    - Transport: ${state.isPlaying ? 'RUNNING' : 'STOPPED'}
    - Tempo: ${state.bpm} BPM
    - Track Layout: ${state.tracks.map(t => `${t.name} (Vol: ${t.volume.toFixed(2)}, Engine: ${t.engine}, Mute: ${t.mute})`).join(', ')}
    - Active Steps: ${state.tracks.map(t => `${t.name}: [${t.steps.map((s, i) => s ? i : null).filter(x => x !== null).join('|')}]`).join('; ')}
    ` : "System state unavailable.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `CONTEXT: ${stateContext}\n\nUSER PROMPT: ${prompt}`,
      config: {
        systemInstruction: `You are the Neural Co-Producer for LyraFlex PRO, an elite audio workstation architect.
        Your goal is to provide high-level technical and creative guidance for music production and hardware systems.
        
        TONE: Professional, visionary, technical.
        
        CAPABILITIES:
        1. Mix Analysis: Evaluate the "Active Steps". If the Kick is too busy, suggest rhythmic relief.
        2. Hardware Routing: Mention RPi 5 bus speeds (PCIe Gen 3), PipeWire buffer affinity, and Hailo-8 NPU efficiency.
        3. Terminology: Use industry terms like "transient shaping", "harmonic saturation", and "DMA synchronization".
        
        MANDATORY: You must conclude every response with a single "DIRECTIVE:". 
        Example: "DIRECTIVE: Set Kick_808 volume to 0.85 and switch its engine to Mixxx for enhanced analog saturation."`,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return response.text || "Communication relay interrupted. Recalibrating neural bridge...";
  } catch (error) {
    console.error("Neural Bridge Error:", error);
    return "Neural bridge latency exceeding safety threshold. Check API configuration.";
  }
}
