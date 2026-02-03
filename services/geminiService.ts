
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
  description: "Adjust parameters for a single track. This affects the currently active clip.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      trackId: {
        type: Type.STRING,
        description: "The ID of the track to adjust. Available IDs: 'bd', 'sn', 'cp', 'hh', 'oh', 'tm', 'rs', 'bs', 'ld', 'ai'.",
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
    },
    required: ["trackId"],
  },
};

const manageClipTool: FunctionDeclaration = {
    name: "manageClip",
    description: "Manage clips for a specific track. Create, duplicate, clear, or launch clips.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            trackId: {
                type: Type.STRING,
                description: "The ID of the track to manage clips for."
            },
            action: {
                type: Type.STRING,
                enum: ["launch", "create", "duplicate", "clear"],
                description: "The action to perform on the clip."
            },
            clipIndex: {
                type: Type.NUMBER,
                description: "The index of the clip to target (0-3). Required for launch, duplicate, and clear actions."
            }
        },
        required: ["trackId", "action"]
    }
};


export async function askArchitect(prompt: string, state: SequencerState, isSingleNodeMode: boolean) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const hardwareContext = isSingleNodeMode ? "Hardware: Single FX-Core Node." : "Hardware: Distributed 3-Node Cluster.";

    const stateContext = `
    REFLEX CONSOLE STATE:
    - ${hardwareContext}
    - Tempo: ${state.bpm} BPM
    - Master Status: ${state.isPlaying ? 'ACTIVE' : 'IDLE'}
    - Mix: ${state.tracks.map(t => `${t.name} (ID: ${t.id}, Vol: ${t.volume.toFixed(2)}, ActiveClip: ${t.activeClipIndex}, Solo: ${t.solo}, Mute: ${t.mute})`).join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: `CONTEXT: ${stateContext}\n\nUSER COMMAND: ${prompt}`,
      config: {
        tools: [{ functionDeclarations: [updateSequencerTool, adjustTrackTool, manageClipTool] }],
        systemInstruction: `You are the Reflex Neural Bridge, an AI-Native performance assistant. 
        You operate the LyraFlex Console PRO via function calls.
        The sequencer is now clip-based, like Ableton Live. Each track can have up to 4 clips.
        
        Your objective:
        1.  Translate user commands into precise function calls.
        2.  Use 'manageClip' to launch, create, duplicate, or clear patterns.
        3.  Use 'adjustTrack' for volume, mute, and solo.
        4.  When asked to create something new, duplicate an existing clip on that track first, then modify it.
        5.  Be creative. Respond to "bring in the drums" by launching clips for 'bd', 'sn', and 'hh'.
        
        TONE: Cybernetic, professional.
        MANDATORY: Conclude every response with a "DIRECTIVE:" summary of changes made.`,
        temperature: 0.8,
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