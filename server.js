
/**
 * LyraFlex (v.FX) - Server Orchestrator
 * Node: Brain (FX-03)
 * Role: Headless Mixxx Engine, FM TX & Content Processing
 */

const { spawn } = require('child_process');
const fs = require('fs');

const CONFIG = {
  FM_FREQ: '101.1',
  STATION_NAME: 'LYRA_FLEX',
  RECORDING_PATH: '/mnt/nvme/recordings',
  AUDIO_DEVICE: 'pipewire-0'
};

// Ensure recording dir exists
if (!fs.existsSync(CONFIG.RECORDING_PATH)) {
  fs.mkdirSync(CONFIG.RECORDING_PATH, { recursive: true });
}

// 1. Start Virtual Framebuffer
console.log('--- INITIALIZING LYRAFLEX VIRTUAL DISPLAY ---');
const xvfb = spawn('Xvfb', [':1', '-screen', '0', '1024x768x16']);

// 2. Start Mixxx Engine
const startMixxx = () => {
  console.log('--- STARTING PERFORMANCE ENGINE (MIXXX) ---');
  const mixxx = spawn('mixxx', [
    '--controller-debug',
    '--resourcePath', '/usr/share/mixxx',
    '--no-vblank'
  ], {
    env: { ...process.env, DISPLAY: ':1' }
  });
  return mixxx;
};

// 3. Start FM Broadcast
const startFMBroadcast = (frequency) => {
  console.log(`--- TRANSMITTING ON ${frequency} MHz ---`);
  const parec = spawn('parec', ['-d', 'pipewire-0.monitor']);
  const fm = spawn('pi-fm-rds', [
    '-freq', frequency,
    '-ps', CONFIG.STATION_NAME,
    '-rt', 'LyraFlex Live Performance',
    '-audio', '-'
  ]);
  parec.stdout.pipe(fm.stdin);
  return { parec, fm };
};

// 4. Content Monetization Hook (Simulation)
const processRecording = (filePath) => {
  console.log(`--- NEURAL MASTERING INITIATED: ${filePath} ---`);
  // Placeholder for calling Hailo-8 NPU mastering model via tappas-run
  // spawn('tappas-run', ['neural_master_v1.hef', '-i', filePath]);
};

// Lifecycle Management
const mixxxProcess = startMixxx();
const fmProcess = startFMBroadcast(CONFIG.FM_FREQ);

process.on('SIGINT', () => {
  console.log('Safe Shutdown: LyraFlex Performance Suite...');
  mixxxProcess.kill();
  fmProcess.parec.kill();
  fmProcess.fm.kill();
  xvfb.kill();
  process.exit();
});
