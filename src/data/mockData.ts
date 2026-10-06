import type { User, GameRecord, Tournament, Achievement, Puzzle, Opening, AILevel } from '../types';

// ═══════════════════════════════════════════════════
// MOCK USERS
// ═══════════════════════════════════════════════════
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'NeonKing',
    email: 'neonking@chess.com',
    rating: 2847,
    gamesPlayed: 1247,
    wins: 834,
    losses: 287,
    draws: 126,
    role: 'USER',
    createdAt: '2024-01-15T10:00:00Z',
    country: 'IN',
    title: 'GM',
    bio: 'Chess is the art of analysis.',
    isOnline: true,
  },
  {
    id: '2',
    username: 'CyberQueen',
    email: 'cyberqueen@chess.com',
    rating: 2654,
    gamesPlayed: 892,
    wins: 591,
    losses: 198,
    draws: 103,
    role: 'USER',
    createdAt: '2024-02-20T08:00:00Z',
    country: 'US',
    title: 'IM',
    isOnline: false,
  },
  {
    id: '3',
    username: 'VoidBishop',
    email: 'voidbishop@chess.com',
    rating: 2401,
    gamesPlayed: 2103,
    wins: 1204,
    losses: 712,
    draws: 187,
    role: 'USER',
    createdAt: '2023-09-10T12:00:00Z',
    country: 'RU',
    isOnline: true,
  },
  {
    id: '4',
    username: 'QuantumRook',
    email: 'quantumrook@chess.com',
    rating: 1987,
    gamesPlayed: 567,
    wins: 298,
    losses: 201,
    draws: 68,
    role: 'USER',
    createdAt: '2024-05-01T09:00:00Z',
    country: 'DE',
    isOnline: true,
  },
  {
    id: '5',
    username: 'PlasmaKnight',
    email: 'plasmaknight@chess.com',
    rating: 1743,
    gamesPlayed: 321,
    wins: 156,
    losses: 142,
    draws: 23,
    role: 'USER',
    createdAt: '2024-07-15T11:00:00Z',
    country: 'BR',
    isOnline: false,
  },
];

export const currentUser: User = {
  id: 'me',
  username: 'SaiCharan',
  email: 'sai@neonmate.chess',
  rating: 1842,
  gamesPlayed: 234,
  wins: 128,
  losses: 87,
  draws: 19,
  role: 'USER',
  createdAt: '2024-06-01T10:00:00Z',
  country: 'IN',
  bio: 'Learning to outthink the machine.',
  isOnline: true,
};

// ═══════════════════════════════════════════════════
// MOCK GAME RECORDS
// ═══════════════════════════════════════════════════
export const mockGames: GameRecord[] = [
  {
    id: 'g1',
    white: mockUsers[0],
    black: mockUsers[1],
    result: '1-0',
    timeControl: '10+0',
    opening: 'Sicilian Defense',
    eco: 'B54',
    date: new Date(Date.now() - 3600000).toISOString(),
    moves: 42,
    whiteRatingChange: +12,
    blackRatingChange: -12,
    accuracy: { white: 94.2, black: 87.1 },
  },
  {
    id: 'g2',
    white: mockUsers[2],
    black: mockUsers[0],
    result: '0-1',
    timeControl: '5+0',
    opening: "Queen's Gambit",
    eco: 'D41',
    date: new Date(Date.now() - 7200000).toISOString(),
    moves: 67,
    whiteRatingChange: -8,
    blackRatingChange: +8,
    accuracy: { white: 82.5, black: 91.3 },
  },
  {
    id: 'g3',
    white: mockUsers[1],
    black: mockUsers[3],
    result: '1/2-1/2',
    timeControl: '15+10',
    opening: 'Ruy Lopez',
    eco: 'C65',
    date: new Date(Date.now() - 10800000).toISOString(),
    moves: 91,
    whiteRatingChange: 0,
    blackRatingChange: 0,
    accuracy: { white: 96.7, black: 95.2 },
  },
  {
    id: 'g4',
    white: mockUsers[3],
    black: mockUsers[4],
    result: '1-0',
    timeControl: '3+0',
    opening: 'French Defense',
    eco: 'C11',
    date: new Date(Date.now() - 86400000).toISOString(),
    moves: 29,
    whiteRatingChange: +15,
    blackRatingChange: -15,
    accuracy: { white: 78.9, black: 61.2 },
  },
];

// ═══════════════════════════════════════════════════
// MOCK TOURNAMENTS
// ═══════════════════════════════════════════════════
export const mockTournaments: Tournament[] = [
  {
    id: 't1',
    name: '⚡ Neon Cup 2026',
    type: 'swiss',
    timeControl: '5+0',
    status: 'ongoing',
    players: mockUsers.slice(0, 5),
    maxPlayers: 64,
    startDate: new Date(Date.now() - 3600000).toISOString(),
    prize: '$500',
    rounds: 7,
    currentRound: 3,
  },
  {
    id: 't2',
    name: '🏆 Cyber Masters',
    type: 'knockout',
    timeControl: '10+5',
    status: 'upcoming',
    players: mockUsers.slice(0, 3),
    maxPlayers: 32,
    startDate: new Date(Date.now() + 86400000).toISOString(),
    prize: '$1000',
    rounds: 5,
  },
  {
    id: 't3',
    name: '🎯 Blitz Arena',
    type: 'round-robin',
    timeControl: '3+2',
    status: 'upcoming',
    players: mockUsers.slice(1, 4),
    maxPlayers: 16,
    startDate: new Date(Date.now() + 172800000).toISOString(),
    rounds: 4,
  },
  {
    id: 't4',
    name: '🌟 Void Championship',
    type: 'swiss',
    timeControl: '15+10',
    status: 'finished',
    players: mockUsers,
    maxPlayers: 128,
    startDate: new Date(Date.now() - 604800000).toISOString(),
    prize: '$2500',
    rounds: 9,
    currentRound: 9,
  },
];

// ═══════════════════════════════════════════════════
// MOCK ACHIEVEMENTS
// ═══════════════════════════════════════════════════
export const mockAchievements: Achievement[] = [
  {
    id: 'a1',
    title: 'First Blood',
    description: 'Win your first game',
    icon: '⚔️',
    rarity: 'common',
    unlockedAt: '2024-06-02T10:00:00Z',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'a2',
    title: 'AI Slayer',
    description: 'Defeat the AI at Master level',
    icon: '🤖',
    rarity: 'rare',
    unlockedAt: '2024-06-15T14:00:00Z',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'a3',
    title: 'Speed Demon',
    description: 'Win a bullet game in under 60 seconds',
    icon: '⚡',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'a4',
    title: 'Checkmate Master',
    description: 'Deliver 100 checkmates',
    icon: '♟️',
    rarity: 'epic',
    progress: 67,
    maxProgress: 100,
  },
  {
    id: 'a5',
    title: 'Puzzle Maniac',
    description: 'Solve 500 puzzles',
    icon: '🧩',
    rarity: 'epic',
    progress: 287,
    maxProgress: 500,
  },
  {
    id: 'a6',
    title: 'Tournament Champion',
    description: 'Win a tournament',
    icon: '🏆',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'a7',
    title: '100 Games',
    description: 'Play 100 rated games',
    icon: '🎮',
    rarity: 'common',
    unlockedAt: '2024-07-01T12:00:00Z',
    progress: 100,
    maxProgress: 100,
  },
  {
    id: 'a8',
    title: 'Endgame Expert',
    description: 'Win 10 endgames from a losing position',
    icon: '♾️',
    rarity: 'legendary',
    progress: 3,
    maxProgress: 10,
  },
];

// ═══════════════════════════════════════════════════
// MOCK PUZZLES
// ═══════════════════════════════════════════════════
export const mockPuzzles: Puzzle[] = [
  {
    id: 'p1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['Ng5', 'Nd4', 'Nxf7'],
    rating: 1450,
    themes: ['fork', 'tactic'],
    title: 'Knight Fork Madness',
    description: 'Find the winning knight fork sequence',
    difficulty: 'medium',
  },
  {
    id: 'p2',
    fen: '6k1/5ppp/p7/1p6/4B3/1P3P1P/P5PK/8 w - - 0 32',
    solution: ['Bc6', 'b4', 'Bd5'],
    rating: 1200,
    themes: ['endgame', 'bishop'],
    title: 'Bishop Endgame',
    description: 'Convert the bishop advantage into a win',
    difficulty: 'easy',
  },
  {
    id: 'p3',
    fen: '2r3k1/p4ppp/1p6/3P4/2Q5/1P3qP1/P6P/R5K1 b - - 0 30',
    solution: ['Qf1+', 'Rxf1', 'Rc1'],
    rating: 1850,
    themes: ['sacrifice', 'checkmate'],
    title: 'Queen Sacrifice',
    description: 'Find the stunning queen sacrifice for checkmate',
    difficulty: 'hard',
  },
];

// ═══════════════════════════════════════════════════
// MOCK OPENINGS
// ═══════════════════════════════════════════════════
export const mockOpenings: Opening[] = [
  { eco: 'B54', name: 'Sicilian Defense', fen: '', moves: '1.e4 c5', winRate: { white: 54, black: 38, draw: 8 } },
  { eco: 'C65', name: 'Ruy Lopez', fen: '', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5', winRate: { white: 57, black: 29, draw: 14 } },
  { eco: 'D41', name: "Queen's Gambit", fen: '', moves: '1.d4 d5 2.c4', winRate: { white: 52, black: 32, draw: 16 } },
  { eco: 'C11', name: 'French Defense', fen: '', moves: '1.e4 e6', winRate: { white: 49, black: 40, draw: 11 } },
  { eco: 'B06', name: 'Caro-Kann Defense', fen: '', moves: '1.e4 c6', winRate: { white: 50, black: 38, draw: 12 } },
  { eco: 'E60', name: "King's Indian Defense", fen: '', moves: '1.d4 Nf6 2.c4 g6', winRate: { white: 46, black: 45, draw: 9 } },
  { eco: 'D02', name: 'London System', fen: '', moves: '1.d4 d5 2.Nf3 Nf6 3.Bf4', winRate: { white: 48, black: 38, draw: 14 } },
  { eco: 'C50', name: 'Italian Game', fen: '', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4', winRate: { white: 55, black: 31, draw: 14 } },
  { eco: 'A10', name: 'English Opening', fen: '', moves: '1.c4', winRate: { white: 48, black: 36, draw: 16 } },
  { eco: 'B01', name: 'Scandinavian Defense', fen: '', moves: '1.e4 d5', winRate: { white: 54, black: 36, draw: 10 } },
];

// ═══════════════════════════════════════════════════
// AI LEVELS
// ═══════════════════════════════════════════════════
export const aiLevels: AILevel[] = [
  { id: 1, name: 'Beginner', depth: 1, elo: 800, description: 'Makes random mistakes', color: '#00F550' },
  { id: 2, name: 'Intermediate', depth: 5, elo: 1200, description: 'Knows basic tactics', color: '#FFC800' },
  { id: 3, name: 'Advanced', depth: 10, elo: 1600, description: 'Plans several moves ahead', color: '#FF9500' },
  { id: 4, name: 'Master', depth: 15, elo: 2000, description: 'Strong positional play', color: '#FF5C5C' },
  { id: 5, name: 'Grandmaster', depth: 20, elo: 2800, description: 'Near-perfect chess engine', color: '#FF00FF' },
];

// ═══════════════════════════════════════════════════
// RATING HISTORY DATA
// ═══════════════════════════════════════════════════
export const generateRatingHistory = () => {
  const data = [];
  let rating = 1200;
  for (let i = 0; i < 30; i++) {
    rating += Math.floor((Math.random() - 0.4) * 40);
    rating = Math.max(800, Math.min(3000, rating));
    data.push({
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      rating,
    });
  }
  return data;
};
