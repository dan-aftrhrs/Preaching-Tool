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

  // Stopwatch logic - more efficient implementation
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning]);

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
    <div className="h-full bg-surface border border-border rounded-xl p-1 md:p-4 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Header: Local Time */}
      <div className="w-full flex justify-between items-center text-xs text-zinc-500 mb-1 md:mb-2 px-1">
        <div className="flex items-center gap-1 hidden sm:flex">
          <Clock size={12} />
          <span>Local</span>
        </div>
        <span className="w-full text-center sm:w-auto">{localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Main Timer Display */}
      <div className="flex-grow flex items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-5xl font-mono font-bold text-zinc-200 tracking-wider">
          {formatTime(time)}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex gap-1 md:gap-2 mt-1 md:mt-4 px-1">
        <button
          onClick={onToggle}
          className={`flex-1 flex items-center justify-center gap-1 py-1 md:py-1.5 rounded-lg font-medium transition-colors text-[10px] md:text-sm ${
            isRunning 
              ? 'bg-yellow-900/20 text-yellow-600 hover:bg-yellow-900/30' 
              : 'bg-emerald-900/20 text-emerald-600 hover:bg-emerald-900/30'
          }`}
        >
          {isRunning ? <Pause size={12} className="md:w-4 md:h-4" /> : <Play size={12} className="md:w-4 md:h-4" />}
        </button>
        <button
          onClick={handleReset}
          className="px-2 md:px-3 py-1 md:py-1.5 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          <RotateCcw size={12} className="md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  );
};