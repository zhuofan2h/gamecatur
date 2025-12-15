import React from 'react';
import { PieceType, PlayerColor } from '../types';
import { SLAYER_THEME, DEMON_THEME } from '../constants';
import { Crown, Sword, Shield, Zap, Skull, Ghost, Star, Crosshair } from 'lucide-react';

interface ChessPieceProps {
  type: PieceType;
  color: PlayerColor;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color }) => {
  const isWhite = color === PlayerColor.WHITE;
  const theme = isWhite ? SLAYER_THEME[type] : DEMON_THEME[type];
  
  // Dynamic Icon Selection based on Piece Type & Theme
  const getIcon = () => {
    if (isWhite) {
      switch (type) {
        case PieceType.KING: return <Crown className="w-8 h-8" />; // Tanjiro
        case PieceType.QUEEN: return <Star className="w-8 h-8" />; // Nezuko
        case PieceType.ROOK: return <Shield className="w-8 h-8" />; // Pillars
        case PieceType.BISHOP: return <Sword className="w-8 h-8" />; // Hashira
        case PieceType.KNIGHT: return <Zap className="w-8 h-8" />; // Zenitsu/Inosuke
        case PieceType.PAWN: return <div className="w-6 h-6 rounded-full border-2 border-current" />; // Corps
      }
    } else {
      switch (type) {
        case PieceType.KING: return <Skull className="w-8 h-8" />; // Muzan
        case PieceType.QUEEN: return <Ghost className="w-8 h-8" />; // Daki
        case PieceType.ROOK: return <Crosshair className="w-8 h-8" />; // Kokushibo
        case PieceType.BISHOP: return <Sword className="w-8 h-8 rotate-180" />; // Douma
        case PieceType.KNIGHT: return <Zap className="w-8 h-8" />; // Akaza
        case PieceType.PAWN: return <div className="w-5 h-5 rotate-45 border-2 border-current bg-current" />; // Demon
      }
    }
  };

  return (
    <div className={`
      relative flex flex-col items-center justify-center 
      transition-transform duration-300 hover:scale-110 
      ${theme.color} drop-shadow-lg
    `}>
      <div className={`p-1 rounded-full bg-slate-900/50 backdrop-blur-sm border ${theme.accent}`}>
        {getIcon()}
      </div>
    </div>
  );
};

export default ChessPiece;