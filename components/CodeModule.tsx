
import React, { useState } from 'react';
import { Copy, Terminal, Check } from 'lucide-react';

interface Props {
  snippet: {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
  };
}

const CodeModule: React.FC<Props> = ({ snippet }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-lg overflow-hidden border border-white/5 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-500" />
          <h4 className="text-sm font-bold text-gray-200">{snippet.title}</h4>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 flex-grow overflow-auto custom-scrollbar">
        <p className="text-xs text-gray-400 mb-4 italic tracking-wide">
          // {snippet.description}
        </p>
        <pre className="text-[11px] font-mono leading-relaxed text-cyan-100 whitespace-pre-wrap">
          {snippet.code}
        </pre>
      </div>
    </div>
  );
};

export default CodeModule;
