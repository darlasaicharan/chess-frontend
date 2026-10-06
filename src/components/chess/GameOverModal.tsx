import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Skull, Handshake, RotateCcw, ArrowRight, Download, X } from 'lucide-react';

interface GameOverModalProps {
  visible: boolean;
  result: 'win' | 'loss' | 'draw';
  reason: string;
  opponent: string;
  playerColor: 'w' | 'b';
  stats?: {
    moveCount: number;
    duration: string;
    accuracy?: number;
    eloChange?: number;
  };
  onNewGame: () => void;
  onRematch: () => void;
  onAnalyze?: () => void;
  onClose: () => void;
}

const resultConfig = {
  win: {
    title: 'Victory!',
    subtitle: 'You proved your superiority',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #00F550, #00D4FF)',
    glow: 'rgba(0,245,80,0.3)',
    textColor: '#00F550',
    bgGradient: 'linear-gradient(135deg, rgba(0,245,80,0.08), rgba(0,212,255,0.06))',
    borderColor: 'rgba(0,245,80,0.25)',
    emoji: '🏆',
  },
  loss: {
    title: 'Defeat',
    subtitle: 'Learn from your mistakes',
    icon: Skull,
    gradient: 'linear-gradient(135deg, #FF5C5C, #FF0080)',
    glow: 'rgba(255,92,92,0.3)',
    textColor: '#FF5C5C',
    bgGradient: 'linear-gradient(135deg, rgba(255,92,92,0.08), rgba(255,0,128,0.06))',
    borderColor: 'rgba(255,92,92,0.25)',
    emoji: '💀',
  },
  draw: {
    title: 'Draw',
    subtitle: 'A well-fought game',
    icon: Handshake,
    gradient: 'linear-gradient(135deg, #FFC800, #FF9500)',
    glow: 'rgba(255,200,0,0.3)',
    textColor: '#FFC800',
    bgGradient: 'linear-gradient(135deg, rgba(255,200,0,0.08), rgba(255,149,0,0.06))',
    borderColor: 'rgba(255,200,0,0.25)',
    emoji: '🤝',
  },
};

export default function GameOverModal({
  visible, result, reason, opponent, stats,
  onNewGame, onRematch, onAnalyze, onClose
}: GameOverModalProps) {
  const cfg = resultConfig[result];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={onClose}
          style={{ zIndex: 100 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 420, width: '90vw', padding: 0, overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: `1px solid ${cfg.borderColor}`,
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 14, right: 14, background: 'none',
                border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2,
                padding: 4, borderRadius: 8, transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={20} />
            </button>

            {/* Header banner */}
            <div style={{
              background: cfg.bgGradient,
              padding: '36px 28px 24px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Animated background particles */}
              {result === 'win' && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: -50, opacity: [0, 1, 0] }}
                  transition={{ duration: 2 + Math.random(), delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
                  style={{
                    position: 'absolute',
                    left: `${10 + (i * 12)}%`,
                    bottom: 0,
                    fontSize: '1.2rem',
                    pointerEvents: 'none',
                  }}
                >
                  {'✨🌟⭐💫✨🌟⭐💫'[i]}
                </motion.div>
              ))}

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                style={{
                  width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                  background: cfg.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 30px ${cfg.glow}`,
                }}
              >
                <Icon size={32} color="#fff" strokeWidth={2.5} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '1.6rem', fontWeight: 900, color: cfg.textColor, marginBottom: 4 }}
              >
                {cfg.emoji} {cfg.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              >
                {cfg.subtitle}
              </motion.p>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 28px 28px' }}>
              {/* Game info */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12, padding: 16, marginBottom: 20,
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Opponent</span>
                  <span style={{ fontWeight: 700 }}>{opponent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Result</span>
                  <span style={{ fontWeight: 700, color: cfg.textColor }}>{reason}</span>
                </div>
                {stats && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Moves</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{stats.moveCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: stats.accuracy ? 10 : 0, fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{stats.duration}</span>
                    </div>
                    {stats.accuracy !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: stats.eloChange !== undefined ? 10 : 0, fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Accuracy</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-cyan)' }}>{stats.accuracy}%</span>
                      </div>
                    )}
                    {stats.eloChange !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Rating</span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 800,
                          color: stats.eloChange > 0 ? '#00F550' : stats.eloChange < 0 ? '#FF5C5C' : 'var(--text-secondary)',
                        }}>
                          {stats.eloChange > 0 ? '+' : ''}{stats.eloChange}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRematch}
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    background: cfg.gradient, border: 'none',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    boxShadow: `0 4px 20px ${cfg.glow}`,
                  }}
                >
                  <RotateCcw size={16} /> Rematch
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onNewGame}
                  className="btn-ghost"
                  style={{
                    flex: 1, padding: '14px 16px', justifyContent: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  New Game
                </motion.button>
              </div>

              {onAnalyze && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onAnalyze}
                  style={{
                    width: '100%', marginTop: 10, padding: '12px',
                    borderRadius: 12, background: 'rgba(155,89,255,0.1)',
                    border: '1px solid rgba(155,89,255,0.2)',
                    color: 'var(--neon-violet)', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,89,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(155,89,255,0.1)'; }}
                >
                  <ArrowRight size={16} /> Analyze Game
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
