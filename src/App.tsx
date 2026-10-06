import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from './store';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlayAIPage from './pages/PlayAIPage';
import PlayOnlinePage from './pages/PlayOnlinePage';
import GameAnalysisPage from './pages/GameAnalysisPage';
import PuzzlesPage from './pages/PuzzlesPage';
import OpeningsPage from './pages/OpeningsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TournamentsPage from './pages/TournamentsPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import FriendsPage from './pages/FriendsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import TrainingPage from './pages/TrainingPage';

import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected — with sidebar layout */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="play/ai" element={<PlayAIPage />} />
            <Route path="play/online" element={<PlayOnlinePage />} />
            <Route path="game/:id/analysis" element={<GameAnalysisPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="puzzles" element={<PuzzlesPage />} />
            <Route path="openings" element={<OpeningsPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1528',
            color: '#F0F4FF',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#00D4FF', secondary: '#0d1528' },
          },
          error: {
            iconTheme: { primary: '#FF5C5C', secondary: '#0d1528' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
