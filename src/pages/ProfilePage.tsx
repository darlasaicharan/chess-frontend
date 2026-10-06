import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Swords, Award, Calendar, TrendingUp, BarChart3, Edit3, Globe,
  Flame, ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useCurrentUser } from '../store';
import { mockUsers, mockGames, mockAchievements } from '../data/mockData';
import { userService, gameService } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const activeUser = useCurrentUser();
  const { username } = useParams<{ username: string }>();

  const targetUsername = username || activeUser.username;
  const isMe = targetUsername.toLowerCase() === activeUser.username.toLowerCase();

  const [profile, setProfile] = useState<any>(isMe ? activeUser : null);
  const [stats, setStats] = useState<any>(null);
  const [ratingHistory, setRatingHistory] = useState<any[]>([]);
  const [userGames, setUserGames] = useState<any[]>([]);
  const [bio, setBio] = useState(activeUser.bio || 'Master the board. Outthink the machine.');
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profRes, statsRes, histRes, gamesRes] = await Promise.allSettled([
          userService.getProfile(targetUsername),
          userService.getStats(targetUsername),
          userService.getRatingHistory(targetUsername),
          gameService.getGames({ size: 10 }),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value?.data) {
          setProfile(profRes.value.data);
          if (profRes.value.data.bio) setBio(profRes.value.data.bio);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
        if (histRes.status === 'fulfilled' && histRes.value?.data) {
          setRatingHistory(histRes.value.data);
        }
        if (gamesRes.status === 'fulfilled' && gamesRes.value?.data) {
          setUserGames(gamesRes.value.data);
        }
      } catch (e) {
        console.error('Error fetching profile data', e);
      }
    };
    fetchUserData();
  }, [targetUsername]);

  const user = profile || (mockUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase()) || activeUser);

  const displayWins = stats?.wins ?? user.wins ?? 0;
  const displayLosses = stats?.losses ?? user.losses ?? 0;
  const displayDraws = stats?.draws ?? user.draws ?? 0;
  const displayRating = stats?.rating ?? user.rating ?? 1200;
  const displayGamesPlayed = stats?.gamesPlayed ?? user.gamesPlayed ?? (displayWins + displayLosses + displayDraws);

  const total = displayGamesPlayed || (displayWins + displayLosses + displayDraws) || 1;
  const winRate = stats?.winRate != null ? stats.winRate : (total > 0 ? Math.round((displayWins / total) * 100) : 0);

  // Format real rating history data for chart
  const chartData = ratingHistory.length > 0
    ? ratingHistory
    : [{ date: 'Start', rating: displayRating }];

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Profile Header Hero */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: '32px 36px',
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(155,89,255,0.08))',
          border: '1px solid rgba(0,212,255,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div
                className="avatar-placeholder"
                style={{
                  width: 88,
                  height: 88,
                  fontSize: '2rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                  boxShadow: '0 0 30px rgba(0,212,255,0.3)',
                  border: '3px solid rgba(255,255,255,0.1)'
                }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              {user.isOnline && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#00F5A0',
                    border: '3px solid var(--bg-card)',
                    boxShadow: '0 0 10px #00F5A0'
                  }}
                  title="Online Now"
                />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>{user.username}</h1>
                {user.title && <span className="badge badge-yellow" style={{ fontWeight: 800 }}>{user.title}</span>}
                <span className="badge badge-blue">LEVEL 42</span>
                <span className="badge badge-purple">VIP</span>
              </div>

              {/* Bio editor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {isEditingBio ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--neon-blue)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        setIsEditingBio(false);
                        toast.success('Bio updated!');
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', fontStyle: 'italic' }}>"{bio}"</p>
                    {isMe && (
                      <button onClick={() => setIsEditingBio(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit3 size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Globe size={14} color="var(--neon-blue)" /> {user.country || 'Global'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={14} color="#FF7A45" /> 14 Days Streak
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isMe ? (
              <>
                <button className="btn-primary btn-sm" onClick={() => toast.success(`Challenge sent to ${user.username}!`, { icon: '⚔️' })}>
                  <Swords size={16} /> Challenge
                </button>
                <button className="btn-ghost btn-sm" onClick={() => toast.success('Friend request sent!')}>
                  Add Friend
                </button>
              </>
            ) : (
              <Link to="/settings" className="btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <Edit3 size={15} /> Edit Profile & Settings
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ratings Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'BULLET', rating: Math.max(100, displayRating - 25), peak: displayRating + 10, icon: '⚡', color: '#FF5C5C', wins: Math.floor(displayWins * 0.3) },
          { label: 'BLITZ', rating: Math.max(100, displayRating + 5), peak: displayRating + 35, icon: '🔥', color: '#FFC800', wins: Math.floor(displayWins * 0.4) },
          { label: 'RAPID', rating: displayRating, peak: displayRating, icon: '🎯', color: '#00D4FF', wins: displayWins },
          { label: 'PUZZLES', rating: 1500, peak: 1500, icon: '🧠', color: '#00F5A0', wins: 0 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card"
            style={{ padding: 22, borderTop: `3px solid ${stat.color}` }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{stat.label}</div>
              <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff', marginBottom: 4 }}>
              {stat.rating}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Peak: <strong style={{ color: stat.color }}>{stat.peak}</strong></span>
              <span>{stat.wins} Solved/Won</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Charts + Recent Games */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Rating History Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--neon-blue)" /> Rating Progression
            </h3>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
              <span style={{ color: '#00D4FF' }}>● Official ELO</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#4b5563" />
                <YAxis domain={['auto', 'auto']} stroke="#4b5563" />
                <Tooltip contentStyle={{ background: '#0d1528', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="rating" stroke="#00D4FF" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss/Draw Record */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--neon-purple)" /> Win Distribution
          </h3>

          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00F5A0', fontFamily: 'var(--font-mono)' }}>
              {winRate}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Winrate</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#00F5A0' }}>Wins: {displayWins}</span>
              <span style={{ color: '#FF5C5C' }}>Losses: {displayLosses}</span>
              <span style={{ color: '#FFC800' }}>Draws: {displayDraws}</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 8, background: '#1a2744', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${total > 0 ? (displayWins / total) * 100 : 0}%`, background: '#00F5A0' }} />
              <div style={{ width: `${total > 0 ? (displayDraws / total) * 100 : 0}%`, background: '#FFC800' }} />
              <div style={{ width: `${total > 0 ? (displayLosses / total) * 100 : 0}%`, background: '#FF5C5C' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#FFC800" /> Showcase Badges & Achievements
          </h3>
          <Link to="/achievements" style={{ color: 'var(--neon-blue)', fontSize: '0.82rem', textDecoration: 'none' }}>
            View All ({mockAchievements.length}) →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {mockAchievements.slice(0, 4).map(ach => (
            <div
              key={ach.id}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{ fontSize: '1.8rem' }}>{ach.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ach.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ach.rarity.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Swords size={18} color="var(--neon-blue)" /> Recent Matches
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(userGames.length > 0 ? userGames : mockGames).slice(0, 4).map((g: any, idx: number) => (
            <div
              key={g.id || idx}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {g.white?.username || 'White'} ({g.white?.rating ?? 1200}) vs {g.black?.username || 'Black'} ({g.black?.rating ?? 1200})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {g.timeControl || '10+0'} · {g.moves ?? g.moveCount ?? 0} moves · {g.date ? new Date(g.date).toLocaleDateString() : 'Recent'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge" style={{ background: g.result === '1-0' ? 'rgba(0,245,160,0.15)' : 'rgba(255,92,92,0.15)', color: g.result === '1-0' ? '#00F5A0' : '#FF5C5C' }}>
                  {g.result || 'Finished'}
                </span>
                <Link to={g.id ? `/game/${g.id}/analysis` : '#'} className="btn-ghost btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Analyze <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
