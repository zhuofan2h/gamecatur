import React from 'react';
import { PlayerColor } from '../types';
import { LogOut, RotateCcw } from 'lucide-react';

interface VisualEffectsProps {
  isActive: boolean;
  winner: PlayerColor | null;
  method: 'checkmate' | 'timeout' | 'draw' | null;
  onRematch: () => void;
  onMenu: () => void;
}

const VisualEffects: React.FC<VisualEffectsProps> = ({ isActive, winner, method, onRematch, onMenu }) => {
  if (!isActive) return null;

  // The reference dictates a RED/ORANGE frame regardless of winner.
  const frameColor = '#ff5500'; // Fiery Orange-Red
  
  const winnerText = winner === PlayerColor.WHITE ? 'SLAYERS WIN' : 'DEMONS WIN';
  const subText = method === 'checkmate' ? 'CHECKMATE' : method === 'timeout' ? 'TIME OUT' : 'DRAW';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      
      {/* 1. Background Dimmer (Darker for contrast) */}
      <div className="absolute inset-0 bg-black/80 animate-fade-dark backdrop-blur-sm pointer-events-auto"></div>

      {/* 2. THE FRAME (Smaller, Centered, Red with FIRE EFFECT) */}
      <div className="relative animate-shake-hard w-[85vw] max-w-[400px] aspect-[4/5] flex flex-col items-center justify-center pointer-events-none">
        
        {/* === Frame Construction (CSS) === */}
        <div className="absolute inset-0 border-2 border-transparent" style={{ animation: 'fade-dark 1s forwards' }}>
            
            {/* Outer Box with FIRE ANIMATION - Transparent Center */}
            <div className="absolute inset-0 border-[4px] animate-fire-border bg-transparent"></div>

            {/* Inner Thin Line */}
            <div className="absolute inset-3 border" 
                 style={{ borderColor: frameColor, opacity: 0.5 }}>
            </div>

            {/* Corner Accents (Art Deco Style) */}
            {/* Top Left */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4" style={{ borderColor: frameColor }}></div>
            {/* Top Right */}
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4" style={{ borderColor: frameColor }}></div>
            {/* Bottom Left */}
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4" style={{ borderColor: frameColor }}></div>
            {/* Bottom Right */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4" style={{ borderColor: frameColor }}></div>

            {/* Top Crest (Flower Symbol) */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-black flex items-center justify-center border-2 shadow-[0_0_15px_#dc2626]" style={{ borderColor: frameColor, borderRadius: '20px' }}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center animate-spin-slow" style={{ borderColor: frameColor }}>
                    <div className="w-6 h-6 rotate-45 border" style={{ borderColor: frameColor }}></div>
                </div>
            </div>
        </div>

        {/* === CONTENT INSIDE FRAME === */}
        <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4 w-full h-full justify-center">
            
            {/* Visual Icon/Particles */}
            <div className="relative w-20 h-20 mb-2">
                <div className="absolute inset-0 bg-gradient-to-t from-red-600 to-transparent blur-xl opacity-50 animate-pulse"></div>
                {/* Smoke ascending */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-500 blur-md animate-smoke"></div>
                <div className="absolute bottom-0 left-1/3 w-3 h-3 bg-gray-600 blur-md animate-smoke" style={{animationDelay: '0.5s'}}></div>
                
                {/* Chess King Silhouette */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    <path d="M12 2L15 5H9L12 2ZM12 5L14 7H10L12 5ZM7 7L17 7V9H7V7ZM6 9H18V11H6V9ZM5 11H19V17H5V11ZM5 17H19V19H5V17ZM4 19H20V21H4V19Z" />
                </svg>
                {/* Cracks on King */}
                <svg className="absolute inset-0 w-full h-full text-red-500 animate-flicker" viewBox="0 0 24 24">
                     <path d="M 12,5 L 10,12 L 14,15" fill="none" stroke="currentColor" strokeWidth="0.5" />
                     <path d="M 8,15 L 12,18 L 16,15" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
                </svg>
            </div>

            <h2 className="cinzel text-4xl font-black text-white tracking-tighter drop-shadow-md" 
                style={{ textShadow: `0 0 20px ${frameColor}` }}>
                {winner === PlayerColor.WHITE ? 'SLAYERS' : 'DEMONS'}
                <br/>
                <span className="text-2xl text-red-100 opacity-90">WIN</span>
            </h2>

            <div className="h-[2px] w-24 bg-red-500 shadow-[0_0_10px_red]"></div>

            <p className="font-cinzel font-bold text-red-200 tracking-[0.3em] uppercase text-xs">
                {subText}. {winner === PlayerColor.BLACK ? 'BLACK WINS' : 'WHITE WINS'}
            </p>

        </div>

        {/* === BOTTOM ACTION BUTTONS (Clickable) === */}
        <div className="absolute -bottom-16 flex flex-col items-center gap-3 w-full pointer-events-auto">
            
            {/* REMATCH BUTTON */}
            <button 
                onClick={onRematch}
                className="w-48 h-12 bg-[#0f172a] border-2 flex items-center justify-center transform skew-x-[-10deg] hover:bg-red-900/80 transition-colors group cursor-pointer"
                style={{ borderColor: frameColor, boxShadow: `0 0 15px #dc2626` }}
            >
                <div className="flex items-center gap-2 transform skew-x-[10deg]">
                    <RotateCcw className="w-4 h-4 text-white group-hover:-rotate-180 transition-transform duration-500" />
                    <span className="font-cinzel font-bold text-xl text-white tracking-widest drop-shadow-md">
                        REMATCH?
                    </span>
                </div>
                {/* Decorative bits on button */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t border-l opacity-50"></div>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r opacity-50"></div>
            </button>

            {/* BACK TO MENU BUTTON */}
            <button 
                onClick={onMenu}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest group px-4 py-2"
            >
                <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                BACK TO MENU
            </button>

        </div>

      </div>

    </div>
  );
};

export default VisualEffects;