import React from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeInSeconds: number;
  isActive: boolean;
  isLowTime: boolean;
  label: string;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeInSeconds, isActive, isLowTime, label }) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (timeInSeconds === Infinity) return null;

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300
      ${isActive 
        ? 'bg-slate-800 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105' 
        : 'bg-slate-900/50 border-slate-700 opacity-80'}
      ${isLowTime && isActive ? 'animate-pulse border-red-500 text-red-500' : 'text-slate-200'}
    `}>
      <Clock className={`w-4 h-4 ${isActive ? 'animate-spin-slow' : ''}`} />
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-0.5">{label}</span>
        <span className="text-xl font-mono font-bold leading-none">{formattedTime}</span>
      </div>
    </div>
  );
};

export default GameTimer;