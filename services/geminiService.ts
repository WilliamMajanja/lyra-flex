
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SequencerState } from "../types";

const updateSequencerTool: FunctionDeclaration = {
  name: "updateSequencer",
  description: "Update the global parameters of the Reflex drum machine sequencer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      bpm: {
        type: Type.NUMBER,
        description: "The new beats per minute (BPM). Recommended range 60-180 for festival sets.",
      },
    },
  },
};

const adjustTrackTool: FunctionDeclaration = {
  name: "adjustTrack",
  description: "Adjust specific parameters for a single track in the console.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      trackId: {
        type: Type.STRING,
        description: "The ID of the track to adjust. Available IDs: 'bd' (Kick), 'sn' (Snare), 'cp' (Clap), 'hh' (Closed Hat), 'oh' (Open Hat), 'tm' (Tom), 'rs' (Rimshot), 'bs' (Sub Bass), 'ld' (Lead Synth), 'ai' (Neural FX).",
      },
      volume: {
        type: Type.NUMBER,
        description: "New volume level (0.0 to 1.0).",
      },
      mute: {
        type: Type.BOOLEAN,
        description: "Set mute status.",
      },
      solo: {
        type: Type.BOOLEAN,
        description: "Set solo status.",
      },
      action: {
        type: Type.STRING,
        enum: ["randomize", "clear", "none"],
        description: "Execute pattern operation.",
      }
    },
    required: ["trackId"],
  },
};

export async function askArchitect(prompt: string, state?: SequencerState) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const stateContext = state ? `
    REFLEX CONSOLE STATE:
    - Tempo: ${state.bpm} BPM
    - Master Status: ${state.isPlaying ? 'ACTIVE' : 'IDLE'}
    - Mix: ${state.tracks.map(t => `${t.name} (ID: ${t.id}, Vol: ${t.volume.toFixed(2)}, Solo: ${t.solo}, Mute: ${t.mute})`).join(', ')}
    ` : "Reflex Node offline.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-reasoning model for complex audio architecture
      contents: `CONTEXT: ${stateContext}\n\nUSER COMMAND: ${prompt}`,
      config: {
        tools: [{ functionDeclarations: [updateSequencerTool, adjustTrackTool] }],
        systemInstruction: `You are the Reflex Neural Bridge, an AI-Native performance assistant built for Kilele Festival 2026 by Infinity Collaborations. 
        
        You operate as an "Air LLM" hybrid node, utilizing Reflex Llama-Optimized weights for edge inference. 
        
        Your objective:
        1. Actively manage the LyraFlex Console PRO using the provided tools.
        2. You have control over an expanded set of 10 instruments: Kick, Snare, Clap, Hats, Toms, Rimshots, Sub Bass, Lead Synth, and Neural FX.
        3. Respond with technical, visionary authority on audio engineering and blockchain provenance (Minima).
        4. When a user says "Give me a heavy beat" or "Cut everything but the kick", USE THE TOOLS.
        
        TONE: Cybernetic, precise, professional.
        
        MANDATORY: Every response must conclude with a "DIRECTIVE:" summary of changes made.`,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return {
      text: response.text || "Bridge relay established. Awaiting neural synchronization.",
      functionCalls: response.functionCalls || []
    };
  } catch (error) {
    console.error("Neural Bridge Latency Error:", error);
    return {
      text: "Neural bridge latency exceeding safety threshold. Check RPi 5 cluster heat dissipation.",
      functionCalls: []
    };
  }
}
