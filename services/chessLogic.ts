import { Chess, Square } from 'chess.js';

// We use a singleton-like pattern or just a class helper. 
// Since we want React to react to changes, we will use this mainly for utility
// and keep the instance in a Ref within the hook.

export const getLegalMoves = (game: Chess, square: Square) => {
  return game.moves({ square, verbose: true }).map((move) => move.to);
};

export const isGameInCheck = (game: Chess) => game.inCheck();
export const isGameOver = (game: Chess) => game.isGameOver();
export const getTurn = (game: Chess) => game.turn(); // 'w' or 'b'
