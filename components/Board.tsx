import React from 'react';
import { Chess, Square as SquareType } from 'chess.js';
import Square from './Square';
import ChessPiece from './ChessPiece';
import { PieceType, PlayerColor } from '../types';

interface BoardProps {
  game: Chess;
  selectedSquare: SquareType | null;
  possibleMoves: SquareType[];
  onSquareClick: (square: SquareType) => void;
  turn: PlayerColor;
  inCheck: boolean;
  losingKingSquare?: SquareType | null;
  isFlipped?: boolean; // New Prop
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const Board: React.FC<BoardProps> = ({ 
  game, 
  selectedSquare, 
  possibleMoves, 
  onSquareClick,
  inCheck,
  losingKingSquare,
  isFlipped = false
}) => {
  const board = game.board(); 
  const history = game.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const renderSquares = () => {
    const squares: React.ReactElement[] = [];

    // Visual Grid Loop (0,0 is Top Left of screen)
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        // Calculate logical coordinates based on flip state
        // If flipped: Top-Left becomes h1 (index 7,7) instead of a8 (index 0,0)
        const rankIndex = isFlipped ? 7 - r : r;
        const fileIndex = isFlipped ? 7 - f : f;

        const squareId = `${FILES[fileIndex]}${RANKS[rankIndex]}` as SquareType;
        const piece = board[rankIndex][fileIndex]; 

        // Visual coloring logic remains consistent with the grid (checkerboard pattern)
        const isLight = (r + f) % 2 === 0;

        const isPossible = possibleMoves.includes(squareId);
        const isSelected = selectedSquare === squareId;
        const isKingInCheck = inCheck && piece?.type === 'k' && piece?.color === game.turn();
        const isLastSource = lastMove?.from === squareId;
        const isLastDest = lastMove?.to === squareId;
        
        // Check if this piece is the losing king
        const isLosingKing = losingKingSquare === squareId;

        squares.push(
          <Square
            key={squareId}
            id={squareId}
            isLight={isLight}
            isSelected={isSelected}
            isPossibleMove={isPossible}
            isLastMoveSource={isLastSource}
            isLastMoveDest={isLastDest}
            inCheck={!!isKingInCheck}
            onClick={onSquareClick}
          >
            {piece && (
              <div className="relative w-full h-full flex items-center justify-center">
                 {/* The Piece Itself */}
                 <div className={`relative z-10 ${isLosingKing ? 'animate-char' : ''}`}>
                    <ChessPiece 
                      type={piece.type as PieceType} 
                      color={piece.color as PlayerColor} 
                    />
                 </div>

                {/* FX for Losing King: Smoke & Dual Lightning */}
                {isLosingKing && (
                    <>
                      {/* Black Smoke */}
                      <div className="absolute inset-0 bg-black blur-md scale-150 rounded-full -z-0 opacity-80 animate-smoke"></div>
                      
                      {/* Lightning Overlay (Blue & Red) */}
                      <svg className="absolute inset-[-50%] w-[200%] h-[200%] pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100">
                         {/* Blue Lightning */}
                         <path d="M 50,20 L 45,50 L 60,60 L 40,90" fill="none" stroke="#0ea5e9" strokeWidth="2" className="animate-flicker" style={{filter: 'drop-shadow(0 0 5px #0ea5e9)'}} />
                         <path d="M 30,30 L 40,50 L 25,65 L 35,80" fill="none" stroke="#0ea5e9" strokeWidth="1" className="animate-flicker" style={{animationDelay: '0.1s', filter: 'drop-shadow(0 0 3px #0ea5e9)'}} />

                         {/* Red Lightning */}
                         <path d="M 60,10 L 55,40 L 70,55 L 50,95" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-flicker" style={{animationDelay: '0.2s', filter: 'drop-shadow(0 0 5px #ef4444)'}} />
                         <path d="M 70,30 L 60,50 L 75,65 L 65,85" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-flicker" style={{animationDelay: '0.3s', filter: 'drop-shadow(0 0 3px #ef4444)'}} />
                      </svg>
                    </>
                )}
              </div>
            )}
          </Square>
        );
      }
    }
    return squares;
  };

  return (
    <div className="relative p-2 bg-slate-800 rounded-sm shadow-2xl border-4 border-slate-700">
      <div className="grid grid-cols-8 grid-rows-8 w-full aspect-square md:w-[70vmin] max-w-[850px] mx-auto border-2 border-slate-600">
        {renderSquares()}
      </div>
    </div>
  );
};

export default Board;