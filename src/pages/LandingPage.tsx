import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Bot, Zap, Trophy, Users, BarChart3, Brain, Shield, Star, Globe,
  ArrowRight, ChevronDown, Play, Eye, Target
} from 'lucide-react';

// Particle background component
function ParticleField() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    color: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#9B59FF' : '#F000FF',
  }));

  return (
    <div className="particles-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Animated chess board hero
function HeroChessBoard() {
  const pieces = ['♟', '♙', '♞', '♘', '♝', '♗', '♜', '♖', '♛', '♕', '♚', '♔'];
  const floatingPieces = Array.from({ length: 8 }, (_, i) => ({
    piece: pieces[i % pieces.length],
    x: 10 + (i * 12),
    y: 20 + Math.sin(i * 0.8) * 20,
    delay: i * 0.4,
    size: 28 + Math.random() * 20,
    color: i % 2 === 0 ? '#00D4FF' : '#9B59FF',
  }));

  const board = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const isLight = (row + col) % 2 === 0;
    return { id: i, isLight };
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '0 auto' }}>
      {/* Floating pieces */}
      {floatingPieces.map((fp, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${fp.x}%`,
            top: `${fp.y}%`,
            fontSize: fp.size,
            color: fp.color,
            zIndex: 10,
            filter: `drop-shadow(0 0 8px ${fp.color})`,
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4 + i * 0.3,
            delay: fp.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {fp.piece}
        </motion.div>
      ))}

      {/* Board */}
      <motion.div
        className="chess-board"
        style={{ position: 'relative', zIndex: 5 }}
        initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {board.map(({ id, isLight }) => (
          <div
            key={id}
            className={`chess-square ${isLight ? 'light' : 'dark'}`}
            style={{ fontSize: '1.4rem' }}
          >
            {id === 4 && <span style={{ filter: 'drop-shadow(0 0 6px #00D4FF)' }}>♚</span>}
            {id === 60 && <span style={{ filter: 'drop-shadow(0 0 6px #9B59FF)', color: '#ddd' }}>♔</span>}
            {id === 12 && <span style={{ filter: 'drop-shadow(0 0 4px #00D4FF)' }}>♛</span>}
            {id === 52 && <span style={{ filter: 'drop-shadow(0 0 4px #9B59FF)', color: '#ddd' }}>♕</span>}
            {id === 27 && <span style={{ filter: 'drop-shadow(0 0 6px #F000FF)', color: '#00D4FF', fontSize: '1.6rem' }}>♞</span>}
          </div>
        ))}
      </motion.div>

      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        inset: -20,
        background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </div>
  );
}

// Feature card
function FeatureCard({ icon: Icon, title, description, color, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="glass-card"
      style={{ padding: '28px', textAlign: 'center' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{description}</p>
    </motion.div>
  );
}

const features = [
  { icon: Bot, title: 'AI Engine', description: 'Powered by Stockfish — from Beginner to Grandmaster level. Play, analyze, and improve.', color: '#00D4FF' },
  { icon: Globe, title: 'Online Multiplayer', description: 'Real-time games with players worldwide. Matchmaking, private rooms, and ranked play.', color: '#9B59FF' },
  { icon: Trophy, title: 'Tournaments', description: 'Swiss, Knockout, and Round-Robin formats with live brackets and prize pools.', color: '#FFC800' },
  { icon: Brain, title: 'AI Coach', description: 'Get natural language explanations for every move. Personalized training plans.', color: '#F000FF' },
  { icon: BarChart3, title: 'Deep Analytics', description: 'Track rating progression, opening stats, blunder rates, and time management.', color: '#00F5D4' },
  { icon: Target, title: 'Puzzle System', description: 'Daily puzzles, tactics training, and endgame studies with rating tracking.', color: '#FF6B6B' },
  { icon: Users, title: 'Social Chess', description: 'Friends, clubs, teams, and a social feed. Challenge anyone, anywhere.', color: '#9B59FF' },
  { icon: Zap, title: '3D Chess Mode', description: 'Immersive 3D board with ambient lighting, animations, and camera controls.', color: '#00D4FF' },
];

const stats = [
  { value: '2M+', label: 'Players Worldwide' },
  { value: '50M+', label: 'Games Played' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<10ms', label: 'Move Latency' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <ParticleField />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(5,6,10,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #00D4FF, #9B59FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', boxShadow: '0 0 20px rgba(0,212,255,0.3)',
          }}>
            ♟
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>NEONMATE</span>
            <span style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', marginLeft: 6 }}>CHESS</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          {['Features', 'Tournaments', 'Training', 'Leaderboard'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem',
              fontWeight: 500, transition: 'color 200ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--neon-blue)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn-ghost btn-sm">Log In</Link>
          <Link to="/register" className="btn-primary btn-sm">
            <span>Get Started</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        style={{ y, opacity }}
        className="hero-section"
      >
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          padding: '120px 40px 60px', maxWidth: 1200, margin: '0 auto',
          gap: 60, position: 'relative', zIndex: 10,
        }}>
          {/* Left: Text */}
          <div style={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="badge badge-blue" style={{ marginBottom: 20 }}>
                <Zap size={12} />
                NEXT-GEN CHESS PLATFORM
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}
            >
              <span className="gradient-text">MASTER THE BOARD.</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>OUTTHINK THE</span>
              <br />
              <span className="animated-gradient-text">MACHINE.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 12, maxWidth: 480 }}
            >
              The world's most advanced AI-powered chess platform. Play, analyze, compete, and evolve your game with cutting-edge technology.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 36 }}
            >
              BY DARLA SAI CHARAN
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Play size={18} fill="white" />
                  Play Now — Free
                </span>
              </Link>
              <Link to="/login" className="btn-ghost" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                <Eye size={18} />
                Watch Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Chess Board */}
          <motion.div
            style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <HeroChessBoard />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={28} color="var(--neon-blue)" opacity={0.6} />
        </motion.div>

        {/* Gradient overlay bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
          background: 'linear-gradient(transparent, var(--bg-primary))',
          zIndex: 5, pointerEvents: 'none',
        }} />
      </motion.section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: 60 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label" style={{ marginBottom: 12 }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
            Everything You Need to <span className="gradient-text">Dominate Chess</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            From beginner to grandmaster — NEONMATE CHESS has every tool, every feature, every advantage.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ── AI SECTION ── */}
      <section style={{
        padding: '80px 40px',
        background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.03), transparent)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* AI Eval visualization */}
          <motion.div
            style={{ flex: 1, minWidth: 280 }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Bot size={20} color="var(--neon-blue)" />
                <span style={{ fontWeight: 700, color: 'var(--neon-blue)' }}>Stockfish AI Analysis</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--neon-blue)' }}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
              {[
                { label: 'Evaluation', value: '+1.42', color: 'var(--neon-blue)' },
                { label: 'Depth', value: '22/30', color: 'var(--neon-violet)' },
                { label: 'Best Move', value: 'Nxd5', color: '#00F5D4' },
                { label: 'Accuracy', value: '94.2%', color: '#FFC800' },
                { label: 'Mistake', value: 'Bb4?!', color: '#FF6B6B' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}

              {/* Evaluation bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Position Evaluation</div>
                <div style={{ height: 8, background: '#1a2744', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-violet))' }}
                    initial={{ width: '50%' }}
                    animate={{ width: '58%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Black</span>
                  <span>White +1.42</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            style={{ flex: 1, minWidth: 280 }}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-label" style={{ marginBottom: 12 }}>AI Chess Engine</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)', fontWeight: 800, marginBottom: 16 }}>
              Powered by <span className="gradient-text">Stockfish</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
              Our backend integrates Stockfish at up to depth 20, providing near-perfect analysis. Every move is evaluated in real-time with evaluation scores, principal variations, and detailed explanations from our AI coach.
            </p>
            {[
              '5 AI difficulty levels from 800 to 2800 ELO',
              'Real-time evaluation bar with score',
              'Move classification: Brilliant, Good, Mistake, Blunder',
              'Natural language AI coach explanations',
              'Complete game analysis with accuracy scores',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--neon-blue)' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item}</span>
              </div>
            ))}
            <Link to="/register" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Start Playing <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TOURNAMENT SECTION ── */}
      <section id="tournaments" style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: 50 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="section-label" style={{ marginBottom: 12 }}>Competitions</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800 }}>
            Compete in <span className="gradient-text">Live Tournaments</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { name: '⚡ Neon Cup', type: 'Swiss', status: 'LIVE', players: 47, prize: '$500', tc: '5+0', color: '#00D4FF' },
            { name: '🏆 Cyber Masters', type: 'Knockout', status: 'TOMORROW', players: 28, prize: '$1000', tc: '10+5', color: '#9B59FF' },
            { name: '🎯 Blitz Arena', type: 'Arena', status: 'IN 2H', players: 0, prize: 'Rating', tc: '3+2', color: '#FFC800' },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              className="glass-card"
              style={{ padding: 24 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{t.name}</h3>
                <span className={`badge ${t.status === 'LIVE' ? 'badge-red' : 'badge-blue'}`}>
                  {t.status === 'LIVE' && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#FF5C5C', animation: 'pulse-glow 1s infinite', display: 'inline-block', marginRight: 4 }} />}
                  {t.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Format', value: t.type },
                  { label: 'Players', value: `${t.players}/64` },
                  { label: 'Time Control', value: t.tc },
                  { label: 'Prize', value: t.prize },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', color: t.color, borderColor: `${t.color}88` }}>
                Join Tournament
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '100px 40px',
        position: 'relative', zIndex: 10,
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            maxWidth: 700, margin: '0 auto',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(155,89,255,0.08))',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 24,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Top line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-violet), transparent)',
          }} />

          <div style={{ fontSize: 48, marginBottom: 16 }}>♟️</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: 12 }}>
            Ready to <span className="gradient-text">Outthink the Machine?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 32px' }}>
            Join millions of players on NEONMATE CHESS. Free to play, forever. Create your account now.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '16px 36px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Create Free Account <ArrowRight size={18} />
              </span>
            </Link>
            <Link to="/login" className="btn-ghost" style={{ fontSize: '1rem', padding: '16px 36px' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '40px 40px',
        borderTop: '1px solid var(--border-subtle)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>♟️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>NEONMATE CHESS</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>by Darla Sai Charan</div>
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 NEONMATE CHESS. Master the Board. Outthink the Machine.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
