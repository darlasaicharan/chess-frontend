import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bot, Globe, BookOpen, Trophy, Users,
  BarChart3, Target, Star, Settings, LogOut, Bell, ChevronRight,
  History, Shield, Sword, Puzzle
} from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import { currentUser } from '../../data/mockData';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bot, label: 'Play vs AI', path: '/play/ai' },
  { icon: Globe, label: 'Online', path: '/play/online' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Puzzle, label: 'Puzzles', path: '/puzzles' },
  { icon: BookOpen, label: 'Openings', path: '/openings' },
  { icon: Sword, label: 'Training', path: '/training' },
  { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
  { icon: BarChart3, label: 'Leaderboard', path: '/leaderboard' },
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: Star, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const { logout, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const u = user || currentUser;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Sidebar ── */}
      <motion.nav
        className="sidebar"
        initial={false}
        whileHover={{ width: 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        {/* Logo */}
        <div style={{ padding: '0 16px 24px', width: '100%', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #00D4FF, #9B59FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', boxShadow: '0 0 20px rgba(0,212,255,0.3)',
          }}>
            ♟
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              NEONMATE
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              CHESS
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={label}
            >
              <Icon size={20} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Bottom: Profile + Logout */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: 12, overflow: 'hidden' }}>
          {/* Notifications */}
          <button
            onClick={() => toast('Notifications coming soon!', { icon: '🔔' })}
            className="sidebar-item"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', position: 'relative' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Bell size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6, background: 'var(--neon-blue)',
                  color: '#000', borderRadius: 10, fontSize: '0.6rem', padding: '1px 5px', fontWeight: 700, minWidth: 16,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <span style={{ whiteSpace: 'nowrap' }}>Notifications</span>
          </button>

          {/* User Avatar */}
          <NavLink to={`/profile/${u.username}`} className="sidebar-item">
            <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.85rem', flexShrink: 0 }}>
              {u.username[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)' }}>⚡ {u.rating}</div>
            </div>
          </NavLink>

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: '#FF5C5C' }}>
            <LogOut size={20} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap' }}>Logout</span>
          </button>
        </div>
      </motion.nav>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: 72, minHeight: '100vh', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
