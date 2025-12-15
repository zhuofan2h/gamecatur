import { Square, PieceSymbol, Color } from 'chess.js';

export enum PieceType {
  PAWN = 'p',
  ROOK = 'r',
  KNIGHT = 'n',
  BISHOP = 'b',
  QUEEN = 'q',
  KING = 'k'
}

export enum PlayerColor {
  WHITE = 'w',
  BLACK = 'b'
}

export type GameMode = 'untimed' | 'rapid' | 'blitz' | 'bullet';
export type OpponentType = 'human' | 'ai' | 'online'; // Added 'online'
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CharacterTheme {
  name: string;
  color: string;
  accent: string;
  icon?: string;
  element?: string; // e.g., 'Water', 'Fire', 'Thunder'
}

export interface BoardTheme {
  lightTile: string;
  darkTile: string;
  highlight: string;
  check: string;
}

export interface GameState {
  fen: string;
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isTimeout: boolean;
  winner: PlayerColor | null;
  losingKingSquare: Square | null; // New property
  turn: PlayerColor;
  history: string[];
  capturedWhite: PieceSymbol[];
  capturedBlack: PieceSymbol[];
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
  mode: GameMode;
  opponent: OpponentType;
  difficulty: Difficulty;
  // Online Specific
  onlineId?: string;
  isOnlineHost?: boolean;
}

// Helper type for coordinates
export type BoardPosition = Square;

// Network Messages
export interface NetworkMove {
  type: 'MOVE';
  from: Square;
  to: Square;
  promotion?: string;
}

export interface NetworkStart {
  type: 'START';
  mode: GameMode;
}