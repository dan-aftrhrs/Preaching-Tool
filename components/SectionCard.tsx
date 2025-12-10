
import React, { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SermonSectionData } from '../types';

interface Props {
  data: SermonSectionData;
  onChange: (value: string) => void;
  onToggle: () => void;
  isLiveMode: boolean;
  isActive: boolean;
  onActivate: () => void;
}

// Updated color palette to suit Dark/Zinc background
const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  emerald: { // Green (Intro, Out)
    border: 'border-l-emerald-500', 
    bg: 'bg-emerald-950/20', 
    text: 'text-emerald-400', 
    badge: 'bg-emerald-900/40 text-emerald-300' 
  },
  blue: { // Blue (Me, We2)
    border: 'border-l-blue-500', 
    bg: 'bg-blue-950/20', 
    text: 'text-blue-400', 
    badge: 'bg-blue-900/40 text-blue-300' 
  },
  rose: { // Red (We1, You)
    border: 'border-l-rose-500', 
    bg: 'bg-rose-950/20', 
    text: 'text-rose-400', 
    badge: 'bg-rose-900/40 text-rose-300' 
  },
  amber: { // Yellow (God)
    border: 'border-l-amber-400', 
    bg: 'bg-amber-950/20', 
    text: 'text-amber-400', 
    badge: 'bg-amber-900/40 text-amber-300' 
  },
  // Fallbacks kept just in case
  cyan: { border: 'border-l-cyan-400', bg: 'bg-cyan-950/20', text: 'text-cyan-400', badge: 'bg-cyan-900/40 text-cyan-300' },
};

export const SectionCard: React.FC<Props> = ({ 
  data, 
  onChange, 
  onToggle, 
  isLiveMode, 
  isActive, 
  onActivate 
}) => {
  const styles = colorMap[data.color] || colorMap['cyan'];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  const adjustHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate new scrollHeight (handling shrink)
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
    // Add window resize listener to handle layout changes (e.g. mobile rotation or responsive adjustments)
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [data.content, data.isExpanded]);

  // Live Mode Styles - Adjusted to be less dim (opacity-60 instead of 30)
  // Removed scale transform on mobile to prevent overflow/cutoff
  const containerLiveStyles = isLiveMode 
    ? isActive 
        ? `opacity-100 ring-2 ring-offset-2 ring-offset-black ring-${data.color}-500 shadow-xl md:scale-[1.01]` 
        : 'opacity-60 hover:opacity-80 grayscale-[0.3]' 
    : 'opacity-100';

  return (
    <div 
        id={data.id}
        className={`bg-surface border border-border rounded-lg overflow-hidden transition-all duration-300 ${styles.border} border-l-4 shadow-sm hover:shadow-md ${containerLiveStyles} print:bg-white print:border-zinc-300 print:shadow-none print:break-inside-avoid page-break-inside-avoid`}
        onClick={() => isLiveMode && onActivate()}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-zinc-800 transition-colors print:p-2 print:hover:bg-transparent print:border-b print:border-zinc-100"
        onClick={(e) => {
            if (!isLiveMode) {
                onToggle();
            } else {
                onActivate();
            }
        }}
      >
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <span className={`px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-bold tracking-wider uppercase flex-shrink-0 ${styles.badge} print:bg-zinc-200 print:text-black print:border print:border-zinc-300`}>
            {data.label}
          </span>
          <span className="text-zinc-300 font-semibold text-xs md:text-sm tracking-wide truncate print:text-black">
            {data.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 no-print">
          <button className="text-zinc-500 hover:text-zinc-300">
            {data.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`${!data.isExpanded ? 'hidden print:block' : ''}`}>
        <div className="px-3 md:px-4 pb-3 md:pb-4 print:p-4">
          
          {/* Screen Input */}
          <textarea
            ref={textareaRef}
            className="w-full bg-black/20 text-zinc-200 placeholder-zinc-600 rounded p-2 md:p-3 text-lg focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none overflow-hidden border border-transparent focus:border-zinc-700 transition-all leading-relaxed break-words no-print"
            placeholder={data.placeholder}
            value={data.content}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLiveMode} 
            rows={1} 
          />

          {/* Print Output - Always visible in print, replaces the textarea */}
          <div className="print-only whitespace-pre-wrap text-black text-sm leading-relaxed font-serif">
            {data.content || <span className="text-zinc-400 italic">No content added.</span>}
          </div>

        </div>
      </div>
    </div>
  );
};
