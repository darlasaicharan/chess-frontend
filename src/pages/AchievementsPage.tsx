import { motion } from 'framer-motion';
import { mockAchievements } from '../data/mockData';
import { Star, Lock } from 'lucide-react';

const rarityColors: Record<string, string> = {
  common: '#8892B0',
  rare: '#00D4FF',
  epic: '#9B59FF',
  legendary: '#FFC800',
};

export default function AchievementsPage() {
  const unlocked = mockAchievements.filter(a => a.unlockedAt);
  const locked = mockAchievements.filter(a => !a.unlockedAt);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Star size={28} color="#FFC800" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Achievements</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          {unlocked.length} of {mockAchievements.length} achievements unlocked
        </p>

        {/* Progress bar */}
        <div className="glass" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
              <span style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unlocked.length}/{mockAchievements.length}
              </span>
            </div>
            <div style={{ height: 8, background: '#1a2744', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-violet))' }}
                initial={{ width: 0 }}
                animate={{ width: `${(unlocked.length / mockAchievements.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {Math.round((unlocked.length / mockAchievements.length) * 100)}%
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Complete</div>
          </div>
        </div>

        {/* Unlocked */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#00F550' }}>✅ Unlocked ({unlocked.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {unlocked.map((a, i) => (
            <motion.div
              key={a.id}
              className="achievement-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="achievement-icon">{a.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>{a.description}</div>
              <span className="badge" style={{ background: `${rarityColors[a.rarity]}18`, color: rarityColors[a.rarity], border: `1px solid ${rarityColors[a.rarity]}40` }}>
                {a.rarity.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Locked */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)' }}>🔒 Locked ({locked.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {locked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'center', opacity: 0.6 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8, filter: 'grayscale(1)' }}>{a.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{a.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>{a.description}</div>
              {a.progress !== undefined && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Progress</span>
                    <span>{a.progress}/{a.maxProgress}</span>
                  </div>
                  <div style={{ height: 4, background: '#1a2744', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(a.progress! / a.maxProgress!) * 100}%`, background: rarityColors[a.rarity], borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                </div>
              )}
              <Lock size={14} style={{ marginTop: 8, color: 'var(--text-muted)' }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
