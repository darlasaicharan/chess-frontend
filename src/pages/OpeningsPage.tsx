import { motion } from 'framer-motion';
import { mockOpenings } from '../data/mockData';
import { BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

export default function OpeningsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(mockOpenings[0]);

  const filtered = mockOpenings.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.eco.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <BookOpen size={28} color="var(--neon-cyan)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Opening Database</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Study the world's most important chess openings</p>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          {/* Sidebar List */}
          <div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              placeholder="Search openings..."
              style={{ marginBottom: 14 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 600, overflowY: 'auto' }}>
              {filtered.map((o, i) => (
                <motion.button
                  key={o.eco}
                  onClick={() => setSelected(o)}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    padding: '12px 14px', borderRadius: 10, border: `1px solid ${selected.eco === o.eco ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                    background: selected.eco === o.eco ? 'rgba(0,212,255,0.1)' : 'var(--bg-card)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: selected.eco === o.eco ? 'var(--neon-blue)' : 'var(--text-primary)' }}>{o.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{o.eco}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00F550' }}>{o.winRate.white}%</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <motion.div key={selected.eco} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-blue" style={{ fontFamily: 'var(--font-mono)' }}>{selected.eco}</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selected.name}</h2>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)', fontSize: '0.9rem' }}>{selected.moves}</div>
                </div>
              </div>

              {/* Win Rate Chart */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Win Rate Distribution</div>
                <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
                  <motion.div
                    style={{ background: 'linear-gradient(90deg, #e8e8e8, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#111', fontWeight: 700 }}
                    initial={{ flex: 0 }}
                    animate={{ flex: selected.winRate.white }}
                    transition={{ duration: 0.8 }}
                  >
                    {selected.winRate.white}%
                  </motion.div>
                  <motion.div
                    style={{ background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#ccc', fontWeight: 700 }}
                    initial={{ flex: 0 }}
                    animate={{ flex: selected.winRate.draw }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  >
                    {selected.winRate.draw}%
                  </motion.div>
                  <motion.div
                    style={{ background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#8892B0', fontWeight: 700 }}
                    initial={{ flex: 0 }}
                    animate={{ flex: selected.winRate.black }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {selected.winRate.black}%
                  </motion.div>
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#e8e8e8', display: 'inline-block' }} /> White wins</span>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#555', display: 'inline-block' }} /> Draw</span>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#1a1a2e', border: '1px solid #444', display: 'inline-block' }} /> Black wins</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  { label: 'White Wins', value: `${selected.winRate.white}%`, color: '#F0F0F0', icon: <TrendingUp size={14} /> },
                  { label: 'Draw', value: `${selected.winRate.draw}%`, color: '#8892B0', icon: <Minus size={14} /> },
                  { label: 'Black Wins', value: `${selected.winRate.black}%`, color: '#333', icon: <TrendingDown size={14} /> },
                ].map(s => (
                  <div key={s.label} style={{ padding: 16, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your stats */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>Your Performance with {selected.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Played', value: Math.floor(Math.random() * 40 + 5) },
                  { label: 'Win Rate', value: `${Math.floor(Math.random() * 30 + 45)}%`, color: '#00F550' },
                  { label: 'Avg Accuracy', value: `${(Math.random() * 15 + 80).toFixed(1)}%`, color: 'var(--neon-blue)' },
                  { label: 'Best Streak', value: Math.floor(Math.random() * 5 + 2), color: '#FFC800' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
