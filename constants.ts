import { CharacterTheme, PieceType } from './types';

// Visual mapping for the Demon Slayer Corps (White Pieces)
export const SLAYER_THEME: Record<string, CharacterTheme> = {
  [PieceType.KING]: { name: 'Tanjiro', color: 'text-emerald-400', accent: 'border-emerald-500', element: 'Sun/Water' },
  [PieceType.QUEEN]: { name: 'Nezuko', color: 'text-pink-400', accent: 'border-pink-500', element: 'Blood' },
  [PieceType.BISHOP]: { name: 'Hashira', color: 'text-indigo-400', accent: 'border-indigo-500', element: 'Insect/Water' }, // Giyu/Shinobu
  [PieceType.KNIGHT]: { name: 'Slayer', color: 'text-yellow-400', accent: 'border-yellow-500', element: 'Thunder/Beast' }, // Zenitsu/Inosuke
  [PieceType.ROOK]: { name: 'Pillar', color: 'text-orange-500', accent: 'border-orange-600', element: 'Flame/Sound' }, // Rengoku/Tengen
  [PieceType.PAWN]: { name: 'Mizunoto', color: 'text-cyan-200', accent: 'border-cyan-300', element: 'Breath' },
};

// Visual mapping for the Twelve Kizuki/Demons (Black Pieces)
export const DEMON_THEME: Record<string, CharacterTheme> = {
  [PieceType.KING]: { name: 'Muzan', color: 'text-red-600', accent: 'border-red-700', element: 'Flesh' },
  [PieceType.QUEEN]: { name: 'Daki', color: 'text-fuchsia-600', accent: 'border-fuchsia-700', element: 'Sash' },
  [PieceType.BISHOP]: { name: 'Douma', color: 'text-slate-300', accent: 'border-slate-400', element: 'Ice' },
  [PieceType.KNIGHT]: { name: 'Akaza', color: 'text-rose-500', accent: 'border-rose-600', element: 'Martial Arts' },
  [PieceType.ROOK]: { name: 'Kokushibo', color: 'text-purple-600', accent: 'border-purple-700', element: 'Moon' },
  [PieceType.PAWN]: { name: 'Demon', color: 'text-gray-500', accent: 'border-gray-600', element: 'Minion' },
};

export const BOARD_COLORS = {
  light: 'bg-slate-700',
  dark: 'bg-slate-900',
  selected: 'bg-amber-500/50 ring-inset ring-4 ring-amber-400',
  highlight: 'after:content-[""] after:absolute after:w-4 after:h-4 after:bg-green-500/50 after:rounded-full',
  capture: 'after:content-[""] after:absolute after:w-full after:h-full after:border-4 after:border-red-500/50 after:rounded-sm',
  check: 'bg-red-500/60 ring-inset ring-4 ring-red-500',
};