import { motion } from 'framer-motion';
import { mockTournaments } from '../data/mockData';
import { Trophy, Clock, Users, Zap, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusColor: Record<string, string> = {
  ongoing: '#FF5C5C',
  upcoming: '#00D4FF',
  finished: '#8892B0',
};

export default function TournamentsPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Trophy size={28} color="#FFC800" />
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Tournaments</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Compete in official tournaments and earn your glory</p>
          </div>
          <button className="btn-primary" onClick={() => toast('Tournament creation requires admin access', { icon: '🔒' })}>
            <Zap size={16} /> Create Tournament
          </button>
        </div>

        {/* Featured - Ongoing */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FF5C5C', display: 'inline-block', animation: 'pulse-glow 1s infinite' }} />
          Live Tournaments
        </h2>
        {mockTournaments.filter(t => t.status === 'ongoing').map((t, i) => (
          <motion.div
            key={t.id}
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: 24, marginBottom: 16,
              background: 'linear-gradient(135deg, rgba(255,92,92,0.05), rgba(155,89,255,0.05))',
              borderColor: 'rgba(255,92,92,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{t.name}</h3>
                  <span className="badge badge-red">
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: '#FF5C5C', display: 'inline-block', marginRight: 4, animation: 'pulse-glow 1s infinite' }} />
                    LIVE
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { icon: <Users size={14} />, text: `${t.players.length}/${t.maxPlayers} players` },
                    { icon: <Clock size={14} />, text: t.timeControl },
                    { icon: <Trophy size={14} />, text: t.prize || 'Rating' },
                    { icon: <Zap size={14} />, text: `Round ${t.currentRound}/${t.rounds}` },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.icon} {item.text}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => toast('Spectating live games', { icon: '👁️' })} className="btn-ghost btn-sm">Spectate</button>
                <button onClick={() => toast('You\'re already registered!', { icon: '✅' })} className="btn-primary btn-sm">View Bracket</button>
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Round Progress</span>
                <span>{t.currentRound}/{t.rounds} rounds</span>
              </div>
              <div style={{ height: 4, background: '#1a2744', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, #FF5C5C, #FF9500)', borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((t.currentRound || 0) / (t.rounds || 1)) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Upcoming */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, marginTop: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="var(--neon-blue)" /> Upcoming Tournaments
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {mockTournaments.filter(t => t.status === 'upcoming').map((t, i) => (
            <motion.div
              key={t.id}
              className="glass-card"
              style={{ padding: 24 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t.name}</h3>
                <span className="badge badge-blue">{t.type.toUpperCase()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Time Control', value: t.timeControl },
                  { label: 'Max Players', value: t.maxPlayers },
                  { label: 'Rounds', value: t.rounds },
                  { label: 'Prize', value: t.prize || 'Rating' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {t.players.length}/{t.maxPlayers} registered
                </div>
                <button className="btn-primary btn-sm" onClick={() => toast(`Registered for ${t.name}!`, { icon: '🏆' })}>
                  Register
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Finished */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, marginTop: 28, color: 'var(--text-muted)' }}>
          Completed Tournaments
        </h2>
        {mockTournaments.filter(t => t.status === 'finished').map((t, i) => (
          <motion.div
            key={t.id}
            style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 16, opacity: 0.7,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{t.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.type} · {t.timeControl} · {t.players.length} players</div>
            </div>
            <span className="badge" style={{ background: 'rgba(136,146,176,0.1)', color: '#8892B0', border: '1px solid rgba(136,146,176,0.3)' }}>FINISHED</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronRight size={20} />
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
