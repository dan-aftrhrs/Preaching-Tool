import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  onToggle: () => void;
}

export const Timer: React.FC<TimerProps> = ({ isRunning, onToggle }) => {
  const [time, setTime] = useState(0);
  const [localTime, setLocalTime] = useState(new Date());

  // Local time clock
  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown/Stopwatch logic
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    if (isRunning) {
        onToggle(); // Stop if running
    }
    setTime(0);
  };

  return (
    <div className="h-full bg-surface border border-border rounded-xl p-2 md:p-4 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Header: Local Time */}
      <div className="w-full flex justify-between items-center text-xs text-slate-400 mb-1 md:mb-2">
        <div className="flex items-center gap-1">
          <Clock size={12} className="hidden md:block" />
          <span className="hidden md:inline">Local</span>
        </div>
        <span>{localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Main Timer Display */}
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-5xl font-mono font-bold text-slate-200 tracking-wider">
          {formatTime(time)}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex gap-1 md:gap-2 mt-2 md:mt-4">
        <button
          onClick={onToggle}
          className={`flex-1 flex items-center justify-center gap-2 py-1 md:py-1.5 rounded-lg font-medium transition-colors text-xs md:text-sm ${
            isRunning 
              ? 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30' 
              : 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'
          }`}
        >
          {isRunning ? <Pause size={14} className="md:w-4 md:h-4" /> : <Play size={14} className="md:w-4 md:h-4" />}
        </button>
        <button
          onClick={handleReset}
          className="px-2 md:px-3 py-1 md:py-1.5 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <RotateCcw size={14} className="md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
};