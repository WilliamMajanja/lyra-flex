
import React from 'react';
import { NodeTelemetry, NodeType } from '../types';
import { CLUSTER_CONFIG } from '../constants';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Wind, Gauge, Cpu, Zap } from 'lucide-react';

interface Props {
  data: NodeTelemetry;
}

const TelemetryNode: React.FC<Props> = ({ data }) => {
  const config = data.type === NodeType.NEBULA ? CLUSTER_CONFIG.nebula 
               : data.type === NodeType.PULSE ? CLUSTER_CONFIG.pulse 
               : CLUSTER_CONFIG.brain;

  const sparkData = Array.from({ length: 20 }, (_, i) => ({ val: 30 + Math.random() * 40 }));

  return (
    <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-${config.color}-500/40`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <div className={`p-2 rounded-lg bg-${config.color}-500/5 border border-${config.color}-500/20`}>
            {config.icon}
          </div>
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-wider text-white">{config.name}</h4>
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">{config.specs}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${
            data.status === 'online' ? 'text-emerald-400 bg-emerald-500/5' : 'text-amber-400 bg-amber-500/5'
          }`}>
            {data.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase">
            <span className="flex items-center gap-1"><Gauge className="w-2.5 h-2.5 opacity-50"/> TEMP</span>
            <span className={data.cpuTemp > 70 ? 'text-red-400 font-bold' : 'text-gray-300'}>{data.cpuTemp.toFixed(1)}°C</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${data.cpuTemp > 70 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${(data.cpuTemp / 90) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase">
            <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5 opacity-50"/> LOAD</span>
            <span className="text-gray-300">{data.cpuLoad.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-fuchsia-500/60"
              style={{ width: `${data.cpuLoad}%` }}
            ></div>
          </div>
        </div>
      </div>

      {data.type !== NodeType.BRAIN && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-mono text-gray-500 uppercase">NPU INFERENCE</span>
          </div>
          <span className="text-[9px] font-black font-mono text-cyan-400">{data.npuTops.toFixed(1)} TOPS</span>
        </div>
      )}
    </div>
  );
};

export default TelemetryNode;
