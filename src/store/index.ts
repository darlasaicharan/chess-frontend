import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Notification, GameRecord } from '../types';

// ═══ Auth Store ═══
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refresh: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    { name: 'neonmate-auth' }
  )
);

import { currentUser } from '../data/mockData';
export const useCurrentUser = (): User => {
  const user = useAuthStore((s) => s.user);
  return user || currentUser;
};

// ═══ UI Store ═══
interface UIState {
  sidebarExpanded: boolean;
  soundEnabled: boolean;
  boardTheme: string;
  pieceStyle: string;
  boardFlipped: boolean;
  showCoordinates: boolean;
  animateMoves: boolean;
  reducedMotion: boolean;
  setSidebarExpanded: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setBoardTheme: (theme: string) => void;
  setPieceStyle: (style: string) => void;
  setBoardFlipped: (v: boolean) => void;
  setShowCoordinates: (v: boolean) => void;
  toggleReducedMotion: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarExpanded: false,
      soundEnabled: true,
      boardTheme: 'cyber',
      pieceStyle: 'classic',
      boardFlipped: false,
      showCoordinates: true,
      animateMoves: true,
      reducedMotion: false,
      setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setBoardTheme: (theme) => set({ boardTheme: theme }),
      setPieceStyle: (style) => set({ pieceStyle: style }),
      setBoardFlipped: (v) => set({ boardFlipped: v }),
      setShowCoordinates: (v) => set({ showCoordinates: v }),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: 'neonmate-ui' }
  )
);

// ═══ Notifications Store ═══
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      type: 'friend_request',
      title: 'Friend Request',
      message: 'GrandMaster99 sent you a friend request',
      read: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned "First Blood" — first checkmate!',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'tournament',
      title: 'Tournament Starting',
      message: 'Neon Cup 2026 starts in 30 minutes',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  unreadCount: 2,
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// ═══ Game History Store ═══
interface GameHistoryState {
  games: GameRecord[];
  addGame: (g: GameRecord) => void;
}

export const useGameHistoryStore = create<GameHistoryState>((set) => ({
  games: [],
  addGame: (g) => set((s) => ({ games: [g, ...s.games] })),
}));
