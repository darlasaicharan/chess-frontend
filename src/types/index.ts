// ═══════════════════════════════════════════════════
// NEONMATE CHESS — Global Types
// ═══════════════════════════════════════════════════

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  piece: ChessPiece | null;
  file: number;
  rank: number;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  captured?: PieceType;
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  moves: MoveRecord[];
  capturedWhite: ChessPiece[];
  capturedBlack: ChessPiece[];
}

export interface MoveRecord {
  moveNumber: number;
  white?: string;
  black?: string;
  whiteFen?: string;
  blackFen?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  createdAt: string;
  country?: string;
  bio?: string;
  title?: string;
  isOnline?: boolean;
}

export interface GameRecord {
  id: string;
  white: User;
  black: User;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  timeControl: string;
  opening?: string;
  eco?: string;
  date: string;
  moves: number;
  whiteRatingChange?: number;
  blackRatingChange?: number;
  accuracy?: { white: number; black: number };
}

export interface Tournament {
  id: string;
  name: string;
  type: 'knockout' | 'round-robin' | 'swiss';
  timeControl: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  players: User[];
  maxPlayers: number;
  startDate: string;
  prize?: string;
  rounds?: number;
  currentRound?: number;
}

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  themes: string[];
  title?: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface AIAnalysis {
  evaluation: number;
  depth: number;
  bestMove: string;
  pv: string[];
  nodes?: number;
  time?: number;
  mate?: number;
}

export interface Opening {
  eco: string;
  name: string;
  fen: string;
  moves: string;
  winRate: { white: number; black: number; draw: number };
}

export interface TimeControl {
  initial: number;
  increment: number;
  label: string;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'game_invite' | 'achievement' | 'game_result' | 'tournament';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  type: 'text' | 'emoji';
  read: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  members: number;
  rating: number;
  country?: string;
  createdAt: string;
}

export interface AILevel {
  id: number;
  name: string;
  depth: number;
  elo: number;
  description: string;
  color: string;
}
