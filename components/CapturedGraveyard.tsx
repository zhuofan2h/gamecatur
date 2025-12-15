import React from 'react';
import { PieceSymbol } from 'chess.js';
import { PlayerColor, PieceType } from '../types';
import ChessPiece from './ChessPiece';

interface GraveyardProps {
  pieces: PieceSymbol[]; // List of captured pieces (e.g. ['p', 'q'])
  playerColor: PlayerColor; // The color of the pieces (White or Black)
  label: string;
}

const CapturedGraveyard: React.FC<GraveyardProps> = ({ pieces, playerColor, label }) => {
  // We need to render the pieces that *belong* to playerColor but were captured.
  // The 'pieces' prop passed from parent should already contain the correct list.
  
  if (pieces.length === 0) {
    return (
      <div className="w-full h-16 bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-700">
        <span className="text-slate-600 text-xs uppercase tracking-widest">{label} Empty</span>
      </div>
    );
  }

  // Count instances for cleaner display (e.g., Pawn x5)
  const counts: Record<string, number> = {};
  pieces.forEach(p => { counts[p] = (counts[p] || 0) + 1; });

  return (
    <div className="w-full bg-slate-900/80 p-3 rounded-lg border border-slate-700 flex flex-wrap gap-2 min-h-[4rem] items-center">
        {/* Render simplistic mini versions */}
        {Object.entries(counts).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                <div className="scale-75 origin-left">
                     <ChessPiece type={type as PieceType} color={playerColor} />
                </div>
                {count > 1 && <span className="text-xs font-bold text-slate-400">x{count}</span>}
            </div>
        ))}
    </div>
  );
};

export default CapturedGraveyard;