import React from 'react';
import { Square as SquareType } from 'chess.js';
import { BOARD_COLORS } from '../constants';

interface SquareProps {
  id: SquareType;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMoveSource: boolean;
  isLastMoveDest: boolean;
  inCheck: boolean;
  children?: React.ReactNode;
  onClick: (id: SquareType) => void;
}

const Square: React.FC<SquareProps> = ({
  id,
  isLight,
  isSelected,
  isPossibleMove,
  isLastMoveSource,
  isLastMoveDest,
  inCheck,
  children,
  onClick,
}) => {
  // Base background
  let bgClass = isLight ? BOARD_COLORS.light : BOARD_COLORS.dark;

  // Overrides - Order matters for priority. Check must be first to override others.
  if (inCheck) bgClass = BOARD_COLORS.check;
  else if (isSelected) bgClass = BOARD_COLORS.selected;
  else if (isLastMoveSource || isLastMoveDest) bgClass = 'bg-indigo-500/40';

  // Move indicator styles
  const moveIndicatorClass = isPossibleMove 
    ? children 
      ? BOARD_COLORS.capture // Capture move
      : BOARD_COLORS.highlight // Regular move
    : '';

  return (
    <div
      onClick={() => onClick(id)}
      className={`
        ${bgClass} 
        relative w-full h-full flex items-center justify-center 
        cursor-pointer select-none transition-colors duration-200
        ${moveIndicatorClass}
      `}
      role="button"
      aria-label={`Square ${id}`}
    >
      {/* Coordinate labels (only on edges for visual clean-up) */}
      {id.endsWith('1') && (
        <span className={`absolute bottom-0.5 right-1 text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {id.charAt(0)}
        </span>
      )}
      {id.startsWith('a') && (
        <span className={`absolute top-0.5 left-1 text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {id.charAt(1)}
        </span>
      )}
      
      {children}
    </div>
  );
};

export default Square;