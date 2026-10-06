import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import {
  Globe, Zap, Swords, Clock, Send, Flag, Handshake,
  MessageSquare, Radio, Shield, Sparkles, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChessBoard from '../components/chess/ChessBoard';
import { mockUsers } from '../data/mockData';
import { useCurrentUser } from '../store';
import toast from 'react-hot-toast';
import type { User } from '../types';

interface TimeOption {
  id: string;
  name: string;
  category: 'Bullet' | 'Blitz' | 'Rapid' | 'Classical';
  initialSec: number;
  incrementSec: number;
  icon: string;
  color: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { id: '1-0', name: '1 min', category: 'Bullet', initialSec: 60, incrementSec: 0, icon: '⚡', color: '#FF5C5C' },
  { id: '2-1', name: '2 | 1', category: 'Bullet', initialSec: 120, incrementSec: 1, icon: '🔥', color: '#FF7A45' },
  { id: '3-0', name: '3 min', category: 'Blitz', initialSec: 180, incrementSec: 0, icon: '⚔️', color: '#FFC800' },
  { id: '3-2', name: '3 | 2', category: 'Blitz', initialSec: 180, incrementSec: 2, icon: '⚡', color: '#FFD700' },
  { id: '5-0', name: '5 min', category: 'Blitz', initialSec: 300, incrementSec: 0, icon: '⏳', color: '#00D4FF' },
  { id: '10-0', name: '10 min', category: 'Rapid', initialSec: 600, incrementSec: 0, icon: '🎯', color: '#00F5A0' },
  { id: '15-10', name: '15 | 10', category: 'Rapid', initialSec: 900, incrementSec: 10, icon: '🧠', color: '#9B59FF' },
  { id: '30-0', name: '30 min', category: 'Classical', initialSec: 1800, incrementSec: 0, icon: '🏛️', color: '#E056FD' },
];

function playSynthSound(type: 'move' | 'capture' | 'check' | 'gameover') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'capture') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'check') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export default function PlayOnlinePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [stage, setStage] = useState<'lobby' | 'matching' | 'playing' | 'ended'>('lobby');
  const [selectedTime, setSelectedTime] = useState<TimeOption>(TIME_OPTIONS[2]); // 3 min default
  const [rated, setRated] = useState(true);
  const [customCode, setCustomCode] = useState('');
  
  // Game State
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [opponent, setOpponent] = useState<User>(mockUsers[0]);
  const [moves, setMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>();
  
  // Clocks
  const [whiteTime, setWhiteTime] = useState(180);
  const [blackTime, setBlackTime] = useState(180);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  
  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; isOpponent?: boolean; isSystem?: boolean }>>([
    { sender: 'System', text: 'Game connected. Good luck & have fun!', isSystem: true }
  ]);
  const [inputChat, setInputChat] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Match result
  const [resultMessage, setResultMessage] = useState<{ title: string; subtitle: string; eloChange: number }>({
    title: '',
    subtitle: '',
    eloChange: 0
  });

  // Matchmaking timer simulation
  const [queueTime, setQueueTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (stage === 'matching') {
      interval = setInterval(() => {
        setQueueTime(q => q + 1);
      }, 1000);

      // Simulate find opponent after 3.5s
      const timer = setTimeout(() => {
        const potentialOpponents = mockUsers.filter(u => u.username !== user.username);
        const opp = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)] || mockUsers[1];
        setOpponent(opp);
        const assignedColor = Math.random() > 0.5 ? 'w' : 'b';
        setPlayerColor(assignedColor);
        chess.reset();
        setFen(chess.fen());
        setMoves([]);
        setWhiteTime(selectedTime.initialSec);
        setBlackTime(selectedTime.initialSec);
        setTurn('w');
        setStage('playing');
        toast.success(`Match found! vs ${opp.username} (${opp.rating})`, { icon: '⚔️' });
        
        if (assignedColor === 'b') {
          setTimeout(() => {
            simulateOpponentMove();
          }, 1200);
        }
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [stage]);

  // Turn clock timer
  useEffect(() => {
    if (stage !== 'playing') return;
    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime(t => {
          if (t <= 1) {
            handleTimeout('w');
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) {
            handleTimeout('b');
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, turn]);

  const handleTimeout = (loserColor: 'w' | 'b') => {
    const isPlayerWin = loserColor !== playerColor;
    setResultMessage({
      title: isPlayerWin ? 'Victory by Timeout!' : 'Defeat on Time',
      subtitle: `${loserColor === 'w' ? 'White' : 'Black'} ran out of time.`,
      eloChange: isPlayerWin ? 14 : -12
    });
    setStage('ended');
    playSynthSound('gameover');
  };

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (stage !== 'playing') return false;
    if (chess.turn() !== playerColor) {
      toast.error("It's not your turn!");
      return false;
    }

    try {
      const move = chess.move({
        from: from as any,
        to: to as any,
        promotion: (promotion as any) || 'q'
      });

      if (!move) return false;

      const newFen = chess.fen();
      setFen(newFen);
      setLastMove({ from, to });
      setMoves(m => [...m, move.san]);
      setTurn(chess.turn());

      if (playerColor === 'w') {
        setWhiteTime(t => t + selectedTime.incrementSec);
      } else {
        setBlackTime(t => t + selectedTime.incrementSec);
      }

      if (move.captured) {
        playSynthSound('capture');
      } else if (chess.inCheck()) {
        playSynthSound('check');
      } else {
        playSynthSound('move');
      }

      if (chess.isGameOver()) {
        finishGame();
        return true;
      }

      setTimeout(() => {
        simulateOpponentMove();
      }, 1000 + Math.random() * 1500);

      return true;
    } catch {
      return false;
    }
  };

  const simulateOpponentMove = () => {
    if (chess.isGameOver() || stage !== 'playing') return;

    const legal = chess.moves({ verbose: true });
    if (legal.length === 0) return;

    const checks = legal.filter(m => {
      const test = new Chess(chess.fen());
      test.move(m);
      return test.inCheck();
    });
    const captures = legal.filter(m => m.captured);
    const chosen = (checks.length > 0 && Math.random() < 0.6)
      ? checks[0]
      : (captures.length > 0 && Math.random() < 0.7)
      ? captures[Math.floor(Math.random() * captures.length)]
      : legal[Math.floor(Math.random() * legal.length)];

    const move = chess.move(chosen);
    if (!move) return;

    setFen(chess.fen());
    setLastMove({ from: move.from, to: move.to });
    setMoves(m => [...m, move.san]);
    setTurn(chess.turn());

    if (playerColor === 'w') {
      setBlackTime(t => t + selectedTime.incrementSec);
    } else {
      setWhiteTime(t => t + selectedTime.incrementSec);
    }

    if (move.captured) {
      playSynthSound('capture');
    } else if (chess.inCheck()) {
      playSynthSound('check');
    } else {
      playSynthSound('move');
    }

    if (Math.random() < 0.2) {
      const phrases = ['Interesting move!', 'Good defence.', 'Thinking...', 'Nice structure!'];
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      setChatMessages(prev => [...prev, { sender: opponent.username, text, isOpponent: true }]);
    }

    if (chess.isGameOver()) {
      finishGame();
    }
  };

  const finishGame = () => {
    playSynthSound('gameover');
    if (chess.isCheckmate()) {
      const won = chess.turn() !== playerColor;
      setResultMessage({
        title: won ? 'Checkmate! Victory!' : 'Checkmate. Defeat',
        subtitle: won ? `Spectacular victory against ${opponent.username}` : `Outmaneuvered by ${opponent.username}`,
        eloChange: won ? 16 : -13
      });
    } else if (chess.isDraw()) {
      setResultMessage({
        title: 'Draw!',
        subtitle: chess.isStalemate() ? 'Stalemate reached' : 'Draw by repetition/material',
        eloChange: 2
      });
    }
    setStage('ended');
  };

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign this match?')) {
      setResultMessage({
        title: 'You Resigned',
        subtitle: `Match surrendered to ${opponent.username}`,
        eloChange: -15
      });
      setStage('ended');
      playSynthSound('gameover');
    }
  };

  const handleOfferDraw = () => {
    toast('Draw offer sent to opponent...', { icon: '🤝' });
    setTimeout(() => {
      if (Math.random() > 0.5) {
        toast.success(`${opponent.username} accepted your draw offer!`);
        setResultMessage({
          title: 'Draw Agreed',
          subtitle: 'Mutual handshake agreement',
          eloChange: 1
        });
        setStage('ended');
      } else {
        toast.error(`${opponent.username} declined the draw offer.`);
      }
    }, 2000);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputChat.trim()) return;
    setChatMessages(prev => [...prev, { sender: user.username, text: inputChat.trim() }]);
    setInputChat('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={28} color="var(--neon-blue)" style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.6))' }} />
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Online <span className="gradient-text">Arena</span>
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Compete live against global players with instant Stockfish arbitration & verified ratings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}>
            <Radio size={14} className="pulse-slow" color="#00F5A0" />
            <span>3,842 Players Online</span>
          </div>
          <div className="badge badge-purple" style={{ padding: '8px 14px' }}>
            Rating: <strong>{user.rating}</strong>
          </div>
        </div>
      </div>

      {/* LOBBY STAGE */}
      {stage === 'lobby' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Main selection */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={20} color="var(--neon-blue)" /> Select Time Control
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
              {TIME_OPTIONS.map(opt => {
                const isSelected = selectedTime.id === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedTime(opt)}
                    style={{
                      background: isSelected ? 'rgba(0,212,255,0.12)' : 'var(--bg-card)',
                      border: `1.5px solid ${isSelected ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? '0 0 20px rgba(0,212,255,0.25)' : 'none',
                      borderRadius: 14,
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{opt.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                      {opt.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: opt.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {opt.category}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Match Options */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Rated Match</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Changes your official Elo rating on win or loss</div>
              </div>
              <button
                onClick={() => setRated(!rated)}
                className={`btn-sm ${rated ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 90 }}
              >
                {rated ? 'ON (Rated)' : 'OFF (Casual)'}
              </button>
            </div>

            <button
              onClick={() => {
                setQueueTime(0);
                setStage('matching');
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
              <Swords size={22} />
              FIND MATCH ({selectedTime.name} · {rated ? 'Rated' : 'Casual'})
            </button>
          </div>

          {/* Side Lobby Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Custom Challenge */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="var(--neon-purple)" /> Challenge a Friend
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                Enter your friend's invite room code or create a private custom challenge link.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Enter Code (e.g. CYBER-842)"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    if (!customCode) {
                      toast.error('Please enter a room code');
                      return;
                    }
                    toast.success(`Joining room ${customCode}...`);
                    setStage('matching');
                  }}
                >
                  Join
                </button>
              </div>
              <button
                className="btn-ghost btn-sm"
                style={{ width: '100%', borderColor: 'rgba(155,89,255,0.3)', color: 'var(--neon-purple)' }}
                onClick={() => {
                  const code = `NEON-${Math.floor(1000 + Math.random() * 9000)}`;
                  navigator.clipboard.writeText(`https://neonmate.chess/play/online?code=${code}`);
                  toast.success(`Invite code copied: ${code}! Share with your rival.`);
                }}
              >
                Generate Invite Link
              </button>
            </div>

            {/* Live active battles preview */}
            <div className="glass-card" style={{ padding: 24, flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#FFC800" /> Grandmaster Arena
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { w: 'MagnusAgi', b: 'HikaruCyber', r: '3+0 Blitz', spec: 412 },
                  { w: 'Stockfish_V17', b: 'DeepAlpha', r: '15+10 Rapid', spec: 1290 },
                  { w: 'VoidBishop', b: 'QuantumRook', r: '1+0 Bullet', spec: 84 },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.w} <span style={{ color: 'var(--text-muted)' }}>vs</span> {m.b}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.r} · {m.spec} watching</div>
                    </div>
                    <button
                      className="btn-ghost btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => toast(`Spectating ${m.w} vs ${m.b}`, { icon: '👁️' })}
                    >
                      Watch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MATCHING RADAR SCREEN */}
      {stage === 'matching' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 640, margin: '60px auto', textAlign: 'center' }}
          className="glass-card"
        >
          <div style={{ padding: '48px 32px' }}>
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 28px' }}>
              <div
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(0,212,255,0.2)',
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  borderTop: '3px solid var(--neon-blue)',
                  boxShadow: '0 0 25px rgba(0,212,255,0.5)',
                }}
              />
              <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Swords size={38} color="var(--neon-blue)" />
              </div>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Searching for Opponent...</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Scanning pool for {selectedTime.name} ({rated ? 'Rated' : 'Casual'}) · Elo {user.rating} ± 150
            </p>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', color: 'var(--neon-blue)', fontWeight: 700, marginBottom: 32 }}>
              00:{queueTime < 10 ? `0${queueTime}` : queueTime}
            </div>

            <button
              onClick={() => setStage('lobby')}
              className="btn-ghost"
              style={{ color: '#FF5C5C', borderColor: 'rgba(255,92,92,0.3)' }}
            >
              Cancel Matchmaking
            </button>
          </div>
        </motion.div>
      )}

      {/* ACTIVE GAME PLAYING OR ENDED */}
      {(stage === 'playing' || stage === 'ended') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 600px) 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left: Board & Players */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Top Player (Opponent) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: 14,
                background: turn === (playerColor === 'w' ? 'b' : 'w') ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                border: `1px solid ${turn === (playerColor === 'w' ? 'b' : 'w') ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-placeholder" style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #FF5C5C, #9B59FF)' }}>
                  {opponent.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {opponent.username}
                    {opponent.title && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>{opponent.title}</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating: {opponent.rating} · ({playerColor === 'w' ? 'Black' : 'White'})</div>
                </div>
              </div>

              {/* Opponent Clock */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: (playerColor === 'w' ? blackTime : whiteTime) < 30 ? 'rgba(255,92,92,0.2)' : 'rgba(0,0,0,0.4)',
                  color: (playerColor === 'w' ? blackTime : whiteTime) < 30 ? '#FF5C5C' : '#fff',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
                {formatClock(playerColor === 'w' ? blackTime : whiteTime)}
              </div>
            </div>

            {/* Interactive Board */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ChessBoard
                fen={fen}
                playerColor={playerColor}
                onMove={handleMove}
                flipped={playerColor === 'b'}
                disabled={stage !== 'playing' || chess.turn() !== playerColor}
                lastMove={lastMove}
              />
            </div>

            {/* Bottom Player (Current User) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: 14,
                background: turn === playerColor ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                border: `1px solid ${turn === playerColor ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar-placeholder" style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #00D4FF, #00F5A0)', textTransform: 'uppercase' }}>
                  {user.username.substring(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {user.username} (You)
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>VIP</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating: {user.rating} · ({playerColor === 'w' ? 'White' : 'Black'})</div>
                </div>
              </div>

              {/* User Clock */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: (playerColor === 'w' ? whiteTime : blackTime) < 30 ? 'rgba(255,92,92,0.2)' : 'rgba(0,0,0,0.4)',
                  color: (playerColor === 'w' ? whiteTime : blackTime) < 30 ? '#FF5C5C' : '#fff',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
                {formatClock(playerColor === 'w' ? whiteTime : blackTime)}
              </div>
            </div>

            {/* Quick Actions */}
            {stage === 'playing' && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={handleOfferDraw} className="btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Handshake size={15} /> Offer Draw
                </button>
                <button onClick={handleResign} className="btn-ghost btn-sm" style={{ color: '#FF5C5C', borderColor: 'rgba(255,92,92,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flag size={15} /> Resign
                </button>
              </div>
            )}
          </div>

          {/* Right: Moves & Live Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 600 }}>
            {/* Move Notation Panel */}
            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: 260 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Swords size={16} color="var(--neon-blue)" /> Move Notation
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{moves.length} half-moves</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                {moves.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 40 }}>
                    White plays first. Make your move!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr', gap: '6px 12px', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                    {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, i) => (
                      <div key={i} style={{ display: 'contents' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{moves[i * 2]}</span>
                        <span style={{ color: moves[i * 2 + 1] ? '#00D4FF' : 'transparent' }}>
                          {moves[i * 2 + 1] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Chat Panel */}
            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={16} color="var(--neon-purple)" /> In-Game Chat
              </div>

              {/* Chat list */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4, marginBottom: 10 }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '0.82rem',
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: msg.isSystem ? 'rgba(0,212,255,0.05)' : msg.isOpponent ? 'rgba(255,92,92,0.08)' : 'rgba(255,255,255,0.04)',
                      borderLeft: `2px solid ${msg.isSystem ? 'var(--neon-blue)' : msg.isOpponent ? '#FF5C5C' : '#00F5A0'}`,
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: 6, color: msg.isSystem ? 'var(--neon-blue)' : msg.isOpponent ? '#FF5C5C' : '#00F5A0' }}>
                      {msg.sender}:
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick emote buttons */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
                {['Good luck!', 'Nice move!', 'Thanks for the game!', 'GG 🤝'].map(quick => (
                  <button
                    key={quick}
                    onClick={() => {
                      setChatMessages(prev => [...prev, { sender: user.username, text: quick }]);
                      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                    }}
                    className="btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                  >
                    {quick}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={inputChat}
                  onChange={e => setInputChat(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <button type="submit" className="btn-primary btn-sm" style={{ padding: '0 12px' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      <AnimatePresence>
        {stage === 'ended' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="modal"
              style={{ maxWidth: 460, textAlign: 'center', padding: '36px 32px' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                {resultMessage.eloChange > 0 ? '🏆' : resultMessage.eloChange < 0 ? '💀' : '🤝'}
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>
                {resultMessage.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.95rem' }}>
                {resultMessage.subtitle}
              </p>

              {/* Rating changes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 14, border: '1px solid var(--border-subtle)', marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEW RATING</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neon-blue)' }}>
                    {user.rating + resultMessage.eloChange}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 24 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RATING CHANGE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: resultMessage.eloChange >= 0 ? '#00F5A0' : '#FF5C5C' }}>
                    {resultMessage.eloChange >= 0 ? `+${resultMessage.eloChange}` : resultMessage.eloChange}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => navigate('/game/live-1/analysis')}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
                >
                  <Sparkles size={18} /> Analyze Game with AI Stockfish
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    onClick={() => {
                      setStage('matching');
                      setQueueTime(0);
                    }}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <RotateCcw size={16} /> New Opponent
                  </button>
                  <button
                    onClick={() => setStage('lobby')}
                    className="btn-ghost"
                  >
                    Back to Arena
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
