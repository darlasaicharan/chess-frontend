import axios from 'axios';
import { useAuthStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// ═══════════════════════════════════════════════════
// Auth Services
// ═══════════════════════════════════════════════════
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: (token: string) => api.post('/auth/refresh', { token }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// ═══════════════════════════════════════════════════
// Game Services
// ═══════════════════════════════════════════════════
export const gameService = {
  getGames: (params?: Record<string, unknown>) => api.get('/games', { params }),
  getGame: (id: string) => api.get(`/games/${id}`),
  createAIGame: (config: Record<string, unknown>) => api.post('/games/ai', config),
  makeMove: (gameId: string, move: Record<string, unknown>) =>
    api.post(`/games/${gameId}/move`, move),
  resign: (gameId: string) => api.post(`/games/${gameId}/resign`),
  offerDraw: (gameId: string) => api.post(`/games/${gameId}/draw-offer`),
  exportPGN: (gameId: string) => api.get(`/games/${gameId}/pgn`),
  exportFEN: (gameId: string) => api.get(`/games/${gameId}/fen`),
  /** Called when a frontend AI game ends — persists result + PGN to MySQL */
  finalizeAIGame: (gameId: string, payload: {
    result: 'white' | 'black' | 'draw';
    pgn: string;
    finalFen: string;
    moveCount: number;
  }) => api.post(`/games/${gameId}/finalize-ai`, payload),
};

// ═══════════════════════════════════════════════════
// AI Services
// ═══════════════════════════════════════════════════
export const aiService = {
  getBestMove: (fen: string, depth: number) =>
    api.post('/ai/best-move', { fen, depth }),
  analyzePosition: (fen: string, depth: number) =>
    api.post('/ai/analyze', { fen, depth }),
  analyzeGame: (gameId: string) => api.post(`/ai/analyze-game/${gameId}`),
};

// ═══════════════════════════════════════════════════
// User Services
// ═══════════════════════════════════════════════════
export const userService = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  getStats: (username: string) => api.get(`/users/${username}/stats`),
  searchUsers: (query: string) => api.get('/users/search', { params: { q: query } }),
  getRatingHistory: (username: string) => api.get(`/users/${username}/rating-history`),
};

// ═══════════════════════════════════════════════════
// Friends Services
// ═══════════════════════════════════════════════════
export const friendService = {
  getFriends: () => api.get('/friends'),
  sendRequest: (userId: string) => api.post(`/friends/request/${userId}`),
  acceptRequest: (userId: string) => api.post(`/friends/accept/${userId}`),
  rejectRequest: (userId: string) => api.delete(`/friends/reject/${userId}`),
  removeFriend: (userId: string) => api.delete(`/friends/${userId}`),
  blockUser: (userId: string) => api.post(`/friends/block/${userId}`),
  getPendingRequests: () => api.get('/friends/requests'),
};

// ═══════════════════════════════════════════════════
// Tournament Services
// ═══════════════════════════════════════════════════
export const tournamentService = {
  getTournaments: () => api.get('/tournaments'),
  getTournament: (id: string) => api.get(`/tournaments/${id}`),
  joinTournament: (id: string) => api.post(`/tournaments/${id}/join`),
  createTournament: (data: Record<string, unknown>) => api.post('/tournaments', data),
};

// ═══════════════════════════════════════════════════
// Puzzle Services
// ═══════════════════════════════════════════════════
export const puzzleService = {
  getDailyPuzzle: () => api.get('/puzzles/daily'),
  getPuzzles: (params?: Record<string, unknown>) => api.get('/puzzles', { params }),
  submitAttempt: (puzzleId: string, moves: string[]) =>
    api.post(`/puzzles/${puzzleId}/attempt`, { moves }),
};

// ═══════════════════════════════════════════════════
// Leaderboard Services
// ═══════════════════════════════════════════════════
export const leaderboardService = {
  getGlobal: () => api.get('/leaderboard/global'),
  getFriends: () => api.get('/leaderboard/friends'),
  getByTimeControl: (tc: string) => api.get(`/leaderboard/${tc}`),
};

// ═══════════════════════════════════════════════════
// Achievement Services
// ═══════════════════════════════════════════════════
export const achievementService = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: (username: string) => api.get(`/achievements/user/${username}`),
  updateProgress: (code: string, progress?: number) =>
    api.post('/achievements/progress', { code, progress: progress ?? 1 }),
};
