import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Volume2, VolumeX, Eye, Shield, Key, Bell,
  Palette, Cpu, Check, RefreshCw, Smartphone, Lock
} from 'lucide-react';
import { useUIStore, useAuthStore } from '../store';
import { currentUser } from '../data/mockData';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const {
    boardTheme, setBoardTheme,
    pieceStyle, setPieceStyle,
    soundEnabled, setSoundEnabled,
    showCoordinates, setShowCoordinates,
    boardFlipped, setBoardFlipped
  } = useUIStore();

  const [autoQueen, setAutoQueen] = useState(true);
  const [highlightMoves, setHighlightMoves] = useState(true);
  const [engineDepth, setEngineDepth] = useState(24);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const THEMES = [
    { id: 'cyber', name: 'Cyber Neon', light: '#1a2744', dark: '#0d1528', accent: '#00D4FF' },
    { id: 'neon', name: 'Synthwave', light: '#26143d', dark: '#120a1f', accent: '#9B59FF' },
    { id: 'emerald', name: 'Matrix Emerald', light: '#123024', dark: '#081710', accent: '#00F5A0' },
    { id: 'classic', name: 'Grandmaster Wood', light: '#b88b4a', dark: '#52341b', accent: '#FFC800' },
  ];

  const PIECE_STYLES = [
    { id: 'classic', name: 'Tournament Staunton', icon: '♟' },
    { id: 'neon', name: 'Cyber Hologram', icon: '♞' },
    { id: 'minimal', name: 'Vector Minimal', icon: '♜' },
  ];

  const testAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      toast.success('Sound test chime played!');
    } catch {
      toast('Sound enabled');
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Settings size={28} color="var(--neon-blue)" />
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Preferences & Settings</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your board aesthetics, audio feedback, AI depth, and account security.</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Board Theme */}
        <div className="glass-card" style={{ padding: 26 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color="var(--neon-blue)" /> Board Appearance & Theme
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {THEMES.map(th => {
              const active = boardTheme === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => {
                    setBoardTheme(th.id);
                    toast.success(`Board theme switched to ${th.name}`);
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: `2px solid ${active ? th.accent : 'var(--border-subtle)'}`,
                    boxShadow: active ? `0 0 20px ${th.accent}40` : 'none',
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                >
                  <div style={{ display: 'flex', height: 48, borderRadius: 8, overflow: 'hidden', marginBottom: 10, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ flex: 1, background: th.light }} />
                    <div style={{ flex: 1, background: th.dark }} />
                    <div style={{ flex: 1, background: th.light }} />
                    <div style={{ flex: 1, background: th.dark }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{th.name}</span>
                    {active && <Check size={16} color={th.accent} />}
                  </div>
                </div>
              );
            })}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Piece Set</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {PIECE_STYLES.map(p => {
              const active = pieceStyle === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setPieceStyle(p.id);
                    toast.success(`Piece style set to ${p.name}`);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: active ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{p.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Board Interaction Settings */}
        <div className="glass-card" style={{ padding: 26 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} color="var(--neon-purple)" /> Gameplay Toggles
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                title: 'Audio Sound Effects',
                desc: 'Play crisp cyber move, check, capture, and victory chimes',
                val: soundEnabled,
                toggle: () => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) testAudio();
                }
              },
              {
                title: 'Show Board Coordinates',
                desc: 'Display numbers (1-8) and letters (a-h) along the board borders',
                val: showCoordinates,
                toggle: () => setShowCoordinates(!showCoordinates)
              },
              {
                title: 'Auto-Promote Pawn to Queen',
                desc: 'Automatically promote pawns to queens on the 8th rank for fast blitz play',
                val: autoQueen,
                toggle: () => setAutoQueen(!autoQueen)
              },
              {
                title: 'Highlight Legal Moves & Targets',
                desc: 'Show neon dots for valid square destinations when selecting a piece',
                val: highlightMoves,
                toggle: () => setHighlightMoves(!highlightMoves)
              },
              {
                title: 'Default Flipped View (Black Perspective)',
                desc: 'Render the board from Black side as the default view',
                val: boardFlipped,
                toggle: () => setBoardFlipped(!boardFlipped)
              },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <button
                  onClick={item.toggle}
                  className={`btn-sm ${item.val ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ minWidth: 70 }}
                >
                  {item.val ? 'ENABLED' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI & Stockfish Engine Config */}
        <div className="glass-card" style={{ padding: 26 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={18} color="#00F5A0" /> Stockfish NNUE Engine Settings
          </h2>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Evaluation Search Depth</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--neon-blue)' }}>Depth {engineDepth}</span>
            </div>
            <input
              type="range"
              min={12}
              max={32}
              step={2}
              value={engineDepth}
              onChange={e => setEngineDepth(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--neon-blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>D12 (Fast)</span>
              <span>D24 (Master Recommended)</span>
              <span>D32 (Deep Grandmaster)</span>
            </div>
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="glass-card" style={{ padding: 26 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="#FF5C5C" /> Security & Notifications
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Require authenticator code on sign-in</div>
              </div>
              <button
                onClick={() => {
                  setTwoFactor(!twoFactor);
                  toast.success(twoFactor ? '2FA disabled' : '2FA activated successfully!');
                }}
                className={`btn-sm ${twoFactor ? 'btn-primary' : 'btn-ghost'}`}
              >
                {twoFactor ? 'ACTIVE' : 'ENABLE'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Tournament & Challenge Email Alerts</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Get notified when your tournament round begins</div>
              </div>
              <button
                onClick={() => {
                  setEmailNotifs(!emailNotifs);
                  toast.success(emailNotifs ? 'Email alerts paused' : 'Email alerts activated');
                }}
                className={`btn-sm ${emailNotifs ? 'btn-primary' : 'btn-ghost'}`}
              >
                {emailNotifs ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Password</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last changed 4 weeks ago</div>
              </div>
              <button
                onClick={() => toast('Password reset link sent to your registered email!', { icon: '🔑' })}
                className="btn-ghost btn-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
