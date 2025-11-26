import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, RotateCcw, Printer, Sparkles } from 'lucide-react';
import { Timer } from './components/Timer';
import { SectionCard } from './components/SectionCard';
import { SermonState, INITIAL_SECTIONS } from './types';
import { generateSermon } from './services/gemini';

const STORAGE_KEY = 'sprout_sermon_data';
const SECTION_ORDER: (keyof SermonState['sections'])[] = ['intro', 'me', 'we1', 'god', 'you', 'we2', 'out'];
const SERMON_LAYOUT: (keyof SermonState['sections'])[][] = [
  ['intro'],
  ['me', 'we1'],
  ['god'],
  ['you', 'we2'],
  ['out']
];

export default function App() {
  const [bookReference, setBookReference] = useState('');
  const [verses, setVerses] = useState('');
  const [onePoint, setOnePoint] = useState('');
  const [sections, setSections] = useState<SermonState['sections']>(INITIAL_SECTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Live Mode State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // AI Button Visibility State
  const [isAiVisible, setIsAiVisible] = useState(false);
  const onePointTapCount = useRef(0);
  const onePointTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookReference(parsed.bookReference || '');
        setVerses(parsed.verses || '');
        setOnePoint(parsed.onePoint || '');
        
        const mergedSections = { ...INITIAL_SECTIONS };
        Object.keys(parsed.sections || {}).forEach(key => {
            if (mergedSections[key as keyof typeof INITIAL_SECTIONS]) {
                mergedSections[key as keyof typeof INITIAL_SECTIONS] = {
                    ...mergedSections[key as keyof typeof INITIAL_SECTIONS],
                    ...parsed.sections[key]
                }
            }
        })
        setSections(mergedSections);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const data = { bookReference, verses, onePoint, sections };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [bookReference, verses, onePoint, sections]);

  // Live Mode: Keyboard Navigation
  useEffect(() => {
    if (!isLiveMode) {
        setActiveSectionId(null);
        return;
    }

    // Default to first section if none active
    if (!activeSectionId) {
        setActiveSectionId(SECTION_ORDER[0]);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isLiveMode) return;

        const currentIndex = SECTION_ORDER.findIndex(id => id === activeSectionId);
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = Math.min(currentIndex + 1, SECTION_ORDER.length - 1);
            setActiveSectionId(SECTION_ORDER[nextIndex]);
            scrollToSection(SECTION_ORDER[nextIndex]);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = Math.max(currentIndex - 1, 0);
            setActiveSectionId(SECTION_ORDER[prevIndex]);
            scrollToSection(SECTION_ORDER[prevIndex]);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLiveMode, activeSectionId]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSectionChange = (key: keyof typeof sections, content: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], content },
    }));
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], isExpanded: !prev[key].isExpanded },
    }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setBookReference('');
      setVerses('');
      setOnePoint('');
      setSections(INITIAL_SECTIONS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateFullSermon = async () => {
    if (!verses.trim() && !bookReference.trim()) {
        alert("Please provide a Book Reference or paste Verses.");
        return;
    }
    
    setIsGenerating(true);
    const result = await generateSermon(bookReference, verses, onePoint);
    
    if (result) {
      setOnePoint(result.onePoint);
      setSections(prev => ({
        ...prev,
        intro: { ...prev.intro, content: result.intro },
        me: { ...prev.me, content: result.me },
        we1: { ...prev.we1, content: result.we1 },
        god: { ...prev.god, content: result.god },
        you: { ...prev.you, content: result.you },
        we2: { ...prev.we2, content: result.we2 },
        out: { ...prev.out, content: result.out },
      }));
    } else {
      alert("Failed to generate content. Please try again.");
    }
    
    setIsGenerating(false);
  };

  // File Download/Upload Logic
  const handleDownload = () => {
    const data = JSON.stringify({ bookReference, verses, onePoint, sections }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprout-sermon-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setBookReference(parsed.bookReference || '');
        setVerses(parsed.verses || '');
        setOnePoint(parsed.onePoint || '');
        setSections(parsed.sections || INITIAL_SECTIONS);
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };
  
  const handleOnePointTap = () => {
    onePointTapCount.current += 1;

    if (onePointTapTimer.current) {
        clearTimeout(onePointTapTimer.current);
    }

    if (onePointTapCount.current === 3) {
        setIsAiVisible(prev => !prev);
        onePointTapCount.current = 0;
    } else {
        onePointTapTimer.current = setTimeout(() => {
            onePointTapCount.current = 0;
        }, 500); // Reset after 500ms
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-slate-200 overflow-hidden selection:bg-indigo-500/30 print:bg-white">
      
      {/* STATIC TOP AREA: Verses + Timer + One Point */}
      <div className="flex-none z-20 bg-background shadow-lg shadow-black/20 border-b border-border print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Content Container */}
        <div className="max-w-6xl mx-auto p-3 md:p-4 lg:px-8 md:py-6 space-y-3 md:space-y-4 print:p-0 print:space-y-2">
          
          {/* Top Row: Verses & Timer - 3:1 ratio on all screens */}
          <div className="grid grid-cols-4 gap-3 md:gap-6 print:block">
            {/* Verses Container */}
            <div className="col-span-3 bg-surface border border-border rounded-xl p-0 flex flex-col overflow-hidden shadow-sm h-36 md:h-40 transition-all print:h-auto print:bg-transparent print:border-none print:shadow-none print:mb-4">
               <div className="px-2 md:px-4 py-2 md:py-3 border-b border-border bg-slate-800/50 flex items-center justify-between print:border-none print:bg-transparent print:p-0 print:mb-1">
                  {/* Screen Input */}
                  <input 
                    type="text" 
                    placeholder="Reference..."
                    className="bg-transparent border-none text-slate-200 font-semibold text-xs md:text-sm tracking-wide focus:outline-none placeholder-slate-500 w-full"
                    value={bookReference}
                    onChange={(e) => setBookReference(e.target.value)}
                  />
                  {/* Print View for Reference */}
                  <div className="print-only text-lg font-bold text-black uppercase tracking-wider mb-1">
                    {bookReference || "Scripture Reference"}
                  </div>
                  <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap ml-2 no-print">Scripture Foundation</span>
               </div>
               
               {/* Screen Textarea */}
               <textarea 
                  className="flex-grow bg-transparent p-2 md:p-4 text-slate-300 placeholder-slate-600 focus:outline-none resize-none text-xs md:text-base leading-relaxed"
                  placeholder="Paste scripture..."
                  value={verses}
                  onChange={(e) => setVerses(e.target.value)}
               />

               {/* Print View for Verses */}
               <div className="print-only whitespace-pre-wrap text-sm leading-relaxed text-black border-l-4 border-slate-300 pl-4 italic">
                 {verses || "No scripture provided."}
               </div>
            </div>

            {/* Timer Container */}
            <div className="col-span-1 h-36 md:h-40 no-print">
              <Timer isRunning={isLiveMode} onToggle={() => setIsLiveMode(!isLiveMode)} />
            </div>
          </div>

          {/* Bottom Row (Static): The One Point */}
          <div className="relative group print:mt-4">
             <div 
               className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none no-print cursor-pointer"
               onClick={handleOnePointTap}
               title="Triple-tap to toggle AI helper"
             >
               <span className="text-yellow-500 font-bold text-[10px] md:text-xs tracking-wider uppercase whitespace-nowrap pointer-events-auto">The One Point</span>
             </div>
             
             {/* Screen Input */}
             <input 
               type="text"
               className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 md:py-4 pl-32 sm:pl-36 md:pl-36 pr-10 md:pr-12 text-base md:text-lg font-medium text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all shadow-sm"
               placeholder="State your main idea..."
               value={onePoint}
               onChange={(e) => setOnePoint(e.target.value)}
             />

             {/* Print View for One Point */}
             <div className="print-only text-2xl font-black text-center text-black py-4 border-y-2 border-black my-4">
                {onePoint || "The One Point"}
             </div>

             {isAiVisible && (
                <button 
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2 text-slate-500 hover:text-yellow-400 transition-colors no-print disabled:opacity-50"
                onClick={handleGenerateFullSermon}
                disabled={isGenerating}
                title="Generate Full Sermon from Verses and One Point"
              >
                <Sparkles size={18} className={`md:w-5 md:h-5 ${isGenerating ? "animate-spin text-yellow-500" : ""}`} />
              </button>
             )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE BOTTOM AREA */}
      <div id="scroll-container" className="flex-1 overflow-y-auto print:overflow-visible">
        <main className="max-w-6xl mx-auto p-3 md:p-8 space-y-4 md:space-y-6 print:p-0 print:space-y-4 print:block">
          
          {/* Sermon Sections */}
          <div className="space-y-4 md:space-y-6 pb-10 print:space-y-6 print:pb-0">
            {SERMON_LAYOUT.map((row, rowIndex) => {
              if (row.length === 1) {
                const sectionKey = row[0];
                return (
                  <SectionCard
                    key={sectionKey}
                    data={sections[sectionKey]}
                    onChange={(val) => handleSectionChange(sectionKey, val)}
                    onToggle={() => toggleSection(sectionKey)}
                    isLiveMode={isLiveMode}
                    isActive={activeSectionId === sectionKey}
                    onActivate={() => setActiveSectionId(sectionKey)}
                  />
                );
              }
              return (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 print:grid-cols-1 print:gap-4">
                  {row.map(sectionKey => (
                     <SectionCard
                       key={sectionKey}
                       data={sections[sectionKey]}
                       onChange={(val) => handleSectionChange(sectionKey, val)}
                       onToggle={() => toggleSection(sectionKey)}
                       isLiveMode={isLiveMode}
                       isActive={activeSectionId === sectionKey}
                       onActivate={() => setActiveSectionId(sectionKey)}
                     />
                  ))}
                </div>
              )
            })}
          </div>

          {/* FOOTER ACTIONS & TITLE */}
          <div className="border-t border-border pt-6 md:pt-8 mt-8 md:mt-12 mb-8 no-print">
             <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                 
                 {/* Simplified Logo/Title Area */}
                 <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                    <div>
                        <h1 className="text-xs md:text-sm font-bold tracking-tight text-slate-400 uppercase">Sermon Tool</h1>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                     <label className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-700 cursor-pointer transition-colors text-slate-300">
                       <Upload size={14} className="md:w-4 md:h-4" />
                       Load
                       <input type="file" className="hidden" accept=".json" onChange={handleUpload} />
                     </label>
                     <button onClick={handleDownload} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-700 transition-colors text-slate-300">
                       <Download size={14} className="md:w-4 md:h-4" /> Save
                     </button>
                     <button onClick={handlePrint} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-700 transition-colors text-slate-300">
                       <Printer size={14} className="md:w-4 md:h-4" /> Print
                     </button>
                     <div className="hidden md:block w-px h-8 bg-slate-700 mx-1"></div>
                     <button onClick={handleReset} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-rose-950/30 border border-rose-900/50 text-rose-400 rounded-lg text-xs md:text-sm font-medium hover:bg-rose-900/50 transition-colors">
                       <RotateCcw size={14} className="md:w-4 md:h-4" /> Reset All
                     </button>
                 </div>
             </div>
             
             <footer className="text-center text-slate-600 text-[10px] md:text-xs mt-8">
                Designed for "Communicating for a Change" methodology
             </footer>
          </div>
          
        </main>
      </div>

    </div>
  );
}