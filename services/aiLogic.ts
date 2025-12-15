import { Chess, Move, Piece, Square } from 'chess.js';
import { Difficulty } from '../types';

// --- PIECE-SQUARE TABLES (PST) ---
// These tables define where pieces prefer to be on the board.
// Values are for White side. For Black, we mirror the rank.
// (Simplified standard values)

const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_PST_MID = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

// Piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// --- EVALUATION ENGINE ---

const getPieceValue = (piece: Piece, r: number, c: number): number => {
    let positionValue = 0;
    const isWhite = piece.color === 'w';
    
    // If black, we mirror the row index for the PST (flip the board perspective)
    const row = isWhite ? r : 7 - r;
    const col = c; // Columns are symmetric usually, or we assume standard tables

    switch (piece.type) {
        case 'p': positionValue = PAWN_PST[row][col]; break;
        case 'n': positionValue = KNIGHT_PST[row][col]; break;
        case 'b': positionValue = BISHOP_PST[row][col]; break;
        case 'r': positionValue = ROOK_PST[row][col]; break;
        case 'q': positionValue = QUEEN_PST[row][col]; break;
        case 'k': positionValue = KING_PST_MID[row][col]; break;
        default: break;
    }

    const value = PIECE_VALUES[piece.type] + positionValue;
    return isWhite ? value : -value;
};

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board(); // 8x8 array, row 0 is Rank 8

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        totalEvaluation += getPieceValue(piece, r, c);
      }
    }
  }
  return totalEvaluation;
};

// --- SEARCH ENGINE (MINIMAX) ---

const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number => {
  if (depth === 0) {
    return evaluateBoard(game);
  }

  const moves = game.moves();

  if (moves.length === 0) {
      if (game.isCheckmate()) {
          return isMaximizingPlayer ? -Infinity : Infinity;
      }
      return 0; // Stalemate
  }

  if (isMaximizingPlayer) { // White
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else { // Black (The AI)
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const getBestMoveMinimax = (game: Chess, depth: number): Move | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Shuffle moves to add a tiny bit of variety in equal positions so it doesn't play identical games
  moves.sort(() => Math.random() - 0.5);

  // Optimization: Sort moves to check captures first (helps alpha-beta pruning)
  moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.captured) scoreA = 10;
      if (b.captured) scoreB = 10;
      return scoreB - scoreA;
  });

  let bestMove: Move | null = null;
  let bestValue = Infinity; // AI is Black, so it wants to Minimize the score (White is positive)
  
  // Alpha-Beta initialization
  // Alpha: Best value that the maximizer (White) can guarantee
  // Beta: Best value that the minimizer (Black) can guarantee
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    game.move(move);
    // After AI (Black) moves, it's White's turn (Maximizing player)
    const boardValue = minimax(game, depth - 1, alpha, beta, true);
    game.undo();

    if (boardValue < bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
    
    // Update Beta for the root level
    beta = Math.min(beta, bestValue);
  }

  return bestMove || moves[0];
};

export const getAIMove = (game: Chess, difficulty: Difficulty): Move | null => {
  // AI is always Black in this logic context for now
  
  switch (difficulty) {
    case 'easy':
      // Lower Moon: Depth 1 (Looks 1 step ahead).
      // Will capture hanging pieces but misses tactics.
      return getBestMoveMinimax(game, 1);
      
    case 'medium':
      // Upper Moon: Depth 2 (Looks 2 steps ahead).
      // Sees basic threats and replies.
      return getBestMoveMinimax(game, 2);
      
    case 'hard':
    default:
      // Muzan: Depth 3 (Looks 3 steps ahead).
      // Strong positional play + tactics.
      // Note: Javascript main thread limit prevents going much deeper without WebWorkers.
      return getBestMoveMinimax(game, 3);
  }
};
