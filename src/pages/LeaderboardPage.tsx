import { motion } from 'framer-motion';
import { mockUsers } from '../data/mockData';
import { Trophy, Medal, TrendingUp, Globe, Users, Star } from 'lucide-react';
import { useState } from 'react';

const tabs = ['Global', 'Friends', 'Weekly', 'Monthly', 'Puzzle'];
const flags: Record<string, string> = { IN: '🇮🇳', US: '🇺🇸', RU: '🇷🇺', DE: '🇩🇪', BR: '🇧🇷', CN: '🇨🇳', GB: '🇬🇧' };
const titles: Record<string, string> = { GM: '👑', IM: '⭐', FM: '🔷', NM: '🔹' };

const getRankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'rgba(255,200,0,0.08)', border: 'rgba(255,200,0,0.4)', color: '#FFC800' };
  if (rank === 2) return { bg: 'rgba(180,180,180,0.06)', border: 'rgba(180,180,180,0.4)', color: '#C0C0C0' };
  if (rank === 3) return { bg: 'rgba(200,120,50,0.06)', border: 'rgba(200,120,50,0.4)', color: '#CD7F32' };
  return { bg: 'var(--bg-card)', border: 'var(--border-subtle)', color: 'var(--text-muted)' };
};

const rankEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('Global');

  const extendedUsers = [
    ...mockUsers,
    { ...mockUsers[0], id: 'x1', username: 'ChessWizard', rating: 2801, country: 'CN', title: 'GM' },
    { ...mockUsers[1], id: 'x2', username: 'PixelKnight', rating: 2598, country: 'GB', title: 'IM' },
    { ...mockUsers[2], id: 'x3', username: 'NanoRook', rating: 2350, country: 'DE' },
  ].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Trophy size={28} color="#FFC800" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Leaderboard</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Top players competing for glory worldwide</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'var(--bg-card)', padding: 6, borderRadius: 14, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 200ms', fontFamily: 'var(--font-primary)',
                background: activeTab === tab ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 12, marginBottom: 32 }}>
          {[extendedUsers[1], extendedUsers[0], extendedUsers[2]].map((u, i) => {
            const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const h = actualRank === 1 ? 140 : 110;
            return (
              <motion.div
                key={u.id}
                className="glass-card"
                style={{ padding: '20px 16px', textAlign: 'center', borderColor: actualRank === 1 ? 'rgba(255,200,0,0.3)' : 'var(--border-subtle)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{rankEmoji(actualRank)}</div>
                <div className="avatar-placeholder" style={{ width: 48, height: 48, margin: '0 auto 10px', fontSize: '1rem', borderColor: actualRank === 1 ? 'rgba(255,200,0,0.5)' : undefined }}>
                  {u.username[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                  {u.title && <span style={{ marginRight: 4 }}>{titles[u.title] || ''}</span>}
                  {u.username}
                </div>
                <div style={{ fontSize: '0.75rem', marginBottom: 8 }}>{flags[u.country || ''] || '🌍'}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.3rem',
                  background: actualRank === 1 ? 'linear-gradient(135deg, #FFC800, #FF9500)' : 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {u.rating}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full List */}
        <div>
          {extendedUsers.map((u, i) => {
            const style = getRankStyle(i + 1);
            return (
              <motion.div
                key={u.id + i}
                className="leaderboard-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                style={{ background: style.bg, borderColor: style.border }}
              >
                <div className="rank-badge" style={{ background: `${style.color}18`, color: style.color, minWidth: 36 }}>
                  {i + 1 <= 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </div>
                <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{u.username[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {u.title && <span style={{ marginRight: 6, color: '#FFC800', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>[{u.title}]</span>}
                    {u.username}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{flags[u.country || ''] || '🌍'} {u.country}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>W/L/D</div>
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{u.wins}/{u.losses}/{u.draws}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--neon-blue)' }}>{u.rating}</div>
                  <div style={{ color: '#00F550', fontSize: '0.75rem' }}>+12 today</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
