'use client';

import { useState } from 'react';

type ToolCardProps = {
  type: 'call' | 'result';
  name: string;
  content: string;
};

export function ToolCard({ type, name, content }: ToolCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isCall = type === 'call';
  const summaryText = isCall
    ? `${name}(${content.slice(0, 80)}${content.length > 80 ? '...' : ''})`
    : content.slice(0, 100) + (content.length > 100 ? '...(点击展开)' : '');

  return (
    <div className={`mt-1 max-w-[88%] overflow-hidden rounded-xl border border-solid ${isCall ? 'border-[#243049]' : 'border-[#243049]'} bg-[#151d2c] ${expanded ? '' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.75 text-left transition-colors duration-150 select-none hover:bg-[#1a2436]"
      >
        <span className={`text-[13px] ${isCall ? 'text-[#7ec699]' : 'text-[#e6c07b]'}`}>
          {isCall ? '\u26A1' : '\u2705'}
        </span>
        <span className={`text-[12px] font-semibold ${isCall ? 'text-[#7ec699]' : 'text-[#e6c07b]'}`}>
          {name}
        </span>
        <span className="mr-2 flex-1 truncate text-[11px] text-[#8899aa]">
          {summaryText}
        </span>
        <span
          className={`w-4 shrink-0 text-center text-[11px] text-[#556677] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          &#9660;
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          expanded ? 'max-h-[300px] overflow-y-auto' : 'max-h-0'
        }`}
      >
        <pre className="border-t border-[#1e2a3e] p-3 pt-2 pb-3 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-[#a8bccf]">
          {content}
        </pre>
      </div>
    </div>
  );
}
