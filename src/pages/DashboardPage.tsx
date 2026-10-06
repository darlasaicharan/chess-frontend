import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Target, Zap, Trophy, Users, Bot, Star, Brain,
  ArrowRight, Calendar, Clock, BarChart3, Flame
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useCurrentUser } from '../store';
import { userService, gameService } from '../services/api';
import { mockAchievements, mockGames } from '../data/mockData';

// Stat Card
function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color: string; delay: number;
}) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0d1528', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>⚡ {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function RecentGame({ game, idx, currentUsername }: { game: typeof mockGames[0]; idx: number; currentUsername: string }) {
  const isWhite = game.white.username.toLowerCase() === currentUsername.toLowerCase();
  const result = game.result === '1-0'
    ? (isWhite ? 'win' : 'loss')
    : game.result === '0-1'
      ? (isWhite ? 'loss' : 'win')
      : 'draw';
  const colors: Record<string, string> = { win: '#00F550', loss: '#FF5C5C', draw: '#FFC800' };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + idx * 0.08 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
        borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        marginBottom: 8, transition: 'all 200ms', cursor: 'pointer',
      }}
      whileHover={{ borderColor: 'rgba(0,212,255,0.2)', background: 'var(--bg-card-hover)' }}
    >
      <div style={{
        width: 8, height: 40, borderRadius: 4,
        background: colors[result],
        boxShadow: `0 0 8px ${colors[result]}80`,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
          {game.white.username} vs {game.black.username}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: 12 }}>
          <span>{game.opening}</span>
          <span>·</span>
          <span>{game.timeControl}</span>
          <span>·</span>
          <span>{game.moves} moves</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, color: colors[result], fontSize: '0.9rem', textTransform: 'uppercase' }}>{result}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{game.result}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();

  // Real data from API
  const [stats, setStats] = useState<{
    rating: number; gamesPlayed: number;
    wins: number; losses: number; draws: number; winRate: number;
  } | null>(null);
  const [ratingHistory, setRatingHistory] = useState<{ date: string; rating: number }[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, historyRes, gamesRes] = await Promise.all([
          userService.getStats(user.username),
          userService.getRatingHistory(user.username),
          gameService.getGames({ size: 5 }),
        ]);
        setStats(statsRes.data);
        setRatingHistory(historyRes.data || []);
        setRecentGames(gamesRes.data || []);
      } catch {
        // Backend offline — fall back to user store data
        setStats({
          rating: user.rating,
          gamesPlayed: user.gamesPlayed,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user.username]);

  const displayStats = stats ?? {
    rating: user.rating,
    gamesPlayed: user.gamesPlayed,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0,
  };

  const total = displayStats.gamesPlayed || (displayStats.wins + displayStats.losses + displayStats.draws) || 1;
  const winRate = displayStats.winRate || Math.round((displayStats.wins / total) * 100);
  const unlockedCount = mockAchievements.filter(a => a.unlockedAt).length;
  // Rating change from first to last point in chart
  const ratingChange = ratingHistory.length > 1
    ? ratingHistory[ratingHistory.length - 1].rating - ratingHistory[0].rating
    : 0;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div className="avatar-placeholder" style={{ width: 52, height: 52, fontSize: '1.2rem', textTransform: 'uppercase' }}>
                {user.username.substring(0, 2)}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                  Welcome back, <span className="gradient-text">{user.username}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Master the Board. Outthink the Machine.</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/play/ai" className="btn-primary" style={{ padding: '12px 24px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={16} /> Play vs AI
              </span>
            </Link>
            <Link to="/play/online" className="btn-ghost" style={{ padding: '12px 24px' }}>
              <Users size={16} /> Play Online
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass"
        style={{
          padding: '20px 28px', marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(155,89,255,0.08))',
          border: '1px solid rgba(0,212,255,0.12)',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Flame size={18} color="#FF6B35" />
            <span style={{ fontWeight: 700 }}>Daily Challenge Available!</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Solve today's tactical puzzle and maintain your streak</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)' }}>7</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Day Streak</div>
          </div>
          <Link to="/puzzles" className="btn-primary btn-sm">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Solve Puzzle <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={TrendingUp} label="Rating" value={displayStats.rating} sub="Current ELO" color="#00D4FF" delay={0.1} />
        <StatCard icon={Target} label="Win Rate" value={`${winRate}%`} sub={`${displayStats.wins}W / ${displayStats.losses}L / ${displayStats.draws}D`} color="#00F550" delay={0.15} />
        <StatCard icon={Zap} label="Games Played" value={displayStats.gamesPlayed} sub="Rated games" color="#9B59FF" delay={0.2} />
        <StatCard icon={Flame} label="Win Streak" value={displayStats.wins > 0 ? `${Math.min(displayStats.wins, 5)}` : "0"} sub="Current streak" color="#FF6B35" delay={0.25} />
        <StatCard icon={Trophy} label="Tournaments" value="3" sub="Top 10 finishes" color="#FFC800" delay={0.3} />
        <StatCard icon={Star} label="Achievements" value={`${unlockedCount}/${mockAchievements.length}`} sub="Unlocked" color="#F000FF" delay={0.35} />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Rating Chart */}
          <motion.div
            className="glass"
            style={{ padding: 24 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 2 }}>Rating Progress</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Real performance history</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color={ratingChange >= 0 ? "#00F550" : "#FF5C5C"} />
                <span style={{ color: ratingChange >= 0 ? '#00F550' : '#FF5C5C', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {ratingChange >= 0 ? `+${ratingChange}` : ratingChange}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ratingHistory.length > 0 ? ratingHistory : [{ date: 'Today', rating: displayStats.rating }]}>
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rating" stroke="#00D4FF" strokeWidth={2} fill="url(#ratingGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Games */}
          <motion.div
            className="glass"
            style={{ padding: 24 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>Recent Games</h2>
              <Link to="/history" style={{ color: 'var(--neon-blue)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', gap: 4, alignItems: 'center' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            {(recentGames.length > 0 ? recentGames : mockGames).slice(0, 4).map((game: any, i: number) => (
              <RecentGame key={game.id || i} game={game} idx={i} currentUsername={user.username} />
            ))}
          </motion.div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Play */}
          <motion.div
            className="glass"
            style={{ padding: 24 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>Quick Play</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '⚡ 1 min Bullet', tc: '1+0', color: '#FF5C5C' },
                { label: '🔥 3 min Blitz', tc: '3+0', color: '#FF9500' },
                { label: '⏱ 10 min Rapid', tc: '10+0', color: '#00D4FF' },
              ].map(item => (
                <Link
                  key={item.tc}
                  to="/play/ai"
                  style={{
                    padding: '12px 16px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textDecoration: 'none',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}80`; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{item.tc}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            className="glass"
            style={{ padding: 24 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <Brain size={18} color="var(--neon-violet)" />
              <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>AI Insights</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🎯', text: 'Your accuracy improved to 87.3% this week', color: 'var(--neon-blue)' },
                { icon: '⚠️', text: 'Blunder rate: 2.1% — focus on tactical patterns', color: '#FFC800' },
                { icon: '📚', text: "Sicilian Defense win rate: 68% — your best opening", color: '#00F5D4' },
                { icon: '🏃', text: 'Time management: losing on time in 8% of games', color: '#FF6B6B' },
              ].map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <span>{insight.icon}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>{insight.text}</span>
                </div>
              ))}
            </div>
            <Link to="/training" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--neon-violet)', fontSize: '0.85rem', textDecoration: 'none', marginTop: 14, fontWeight: 600 }}>
              View Training Plan <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Achievements Preview */}
          <motion.div
            className="glass"
            style={{ padding: 24 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>Achievements</h2>
              <Link to="/achievements" style={{ color: 'var(--neon-blue)', fontSize: '0.85rem', textDecoration: 'none' }}>View All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {mockAchievements.slice(0, 8).map(a => (
                <div
                  key={a.id}
                  title={a.title}
                  style={{
                    aspectRatio: 1, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', border: `1px solid ${a.unlockedAt ? 'rgba(155,89,255,0.4)' : 'var(--border-subtle)'}`,
                    background: a.unlockedAt ? 'rgba(155,89,255,0.1)' : 'var(--bg-card)',
                    filter: a.unlockedAt ? 'none' : 'grayscale(1) opacity(0.4)',
                    cursor: 'pointer', transition: 'all 200ms',
                  }}
                >
                  {a.icon}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
