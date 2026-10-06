import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import {
  Bot, RotateCcw, Flag, Zap, Brain, Clock, Gauge
} from 'lucide-react';
import ChessBoard from '../components/chess/ChessBoard';
import GameOverModal from '../components/chess/GameOverModal';
import { aiLevels } from '../data/mockData';
import { useCurrentUser, useAuthStore } from '../store';
import { aiService, gameService } from '../services/api';
import toast from 'react-hot-toast';
import type { AILevel } from '../types';

// ── AI Move Engine ──
// Tries backend first, falls back to local heuristic
async function getAIMove(fen: string, level: AILevel): Promise<string | null> {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return null;
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const legalUciMoves = new Set(moves.map(m => m.from + m.to + (m.promotion || '')));

  // Try backend API first with legal move verification
  try {
    const res = await aiService.getBestMove(fen, level.depth);
    const backendMove = res.data?.bestMove;
    if (backendMove && typeof backendMove === 'string' && legalUciMoves.has(backendMove)) {
      return backendMove;
    }
  } catch {
    // Backend offline or unavailable — continue smoothly with local engine
  }

  // Local fallback with calibrated delay for realism
  const delayMs = Math.min(1000, 300 + Math.random() * 400 * (level.id / 3));
  await new Promise(r => setTimeout(r, delayMs));

  if (level.id === 1) {
    // Level 1: Pure random legal move
    const m = moves[Math.floor(Math.random() * moves.length)];
    return m.from + m.to + (m.promotion || '');
  }

  // Score moves with a tactical heuristic
  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };
  const scoredMoves = moves.map(m => {
    let score = Math.random() * 0.5;

    // Captures
    if (m.captured) score += pieceValues[m.captured] * (0.5 + level.id * 0.1);

    // Checks and checkmate
    try {
      const tempChess = new Chess(fen);
      tempChess.move(m);
      if (tempChess.inCheck()) score += 2 * (level.id / 5);
      if (tempChess.isCheckmate()) score += 100;
    } catch {
      // Ignore
    }

    // Center control
    if (['d4', 'd5', 'e4', 'e5'].includes(m.to)) score += 0.5;
    if (['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'].includes(m.to)) score += 0.2;

    // Development (knight/bishop) early
    if (m.piece === 'n' || m.piece === 'b') score += 0.3;

    // Avoid hanging pieces at higher levels
    if (level.id >= 3) {
      try {
        const tempBoard = new Chess(fen);
        tempBoard.move(m);
        const responses = tempBoard.moves({ verbose: true });
        const recaptured = responses.find(r => r.to === m.to && r.captured);
        if (recaptured) {
          const lostValue = pieceValues[m.piece] || 0;
          const gainedValue = m.captured ? pieceValues[m.captured] : 0;
          if (lostValue > gainedValue) score -= (lostValue - gainedValue) * (level.id / 5);
        }
      } catch {
        // Ignore
      }
    }

    return { move: m, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);

  // Higher levels pick closer to the best move
  const topN = Math.max(1, Math.ceil(scoredMoves.length * (0.3 / level.id)));
  const chosen = scoredMoves[Math.floor(Math.random() * topN)].move;
  return chosen.from + chosen.to + (chosen.promotion || '');
}

// ── Evaluation Bar ──
function EvalBar({ score, mate }: { score: number; mate?: number | null }) {
  const pct = mate
    ? (mate > 0 ? 85 : 15)
    : Math.max(8, Math.min(92, 50 + score * 5));
  const label = mate ? `M${Math.abs(mate)}` : (score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
        color: score >= 0 ? '#e8e8e8' : '#888',
      }}>{label}</span>
      <div style={{
        width: 20, height: 400, background: '#111825',
        borderRadius: 10, overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
      }}>
        <motion.div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, #e8e8e8 0%, #ffffff 100%)',
            borderRadius: '9px 9px 0 0',
          }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Midline */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 1, background: 'rgba(0,212,255,0.3)',
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>eval</span>
    </div>
  );
}

// ── Move History Panel ──
function MoveHistory({ moves, currentIdx, onJump }: {
  moves: string[]; currentIdx: number; onJump: (i: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pairs: [string, string?][] = [];
  for (let i = 0; i < moves.length; i += 2) pairs.push([moves[i], moves[i + 1]]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [moves.length]);

  return (
    <div ref={listRef} style={{ height: 220, overflowY: 'auto', padding: '8px 0' }}>
      {pairs.length === 0 ? (
        <div style={{
          color: 'var(--text-muted)', textAlign: 'center', padding: '30px 20px',
          fontSize: '0.85rem', fontStyle: 'italic',
        }}>
          <Brain size={24} style={{ marginBottom: 8, opacity: 0.3 }} /><br />
          No moves yet — make your first move!
        </div>
      ) : pairs.map(([w, b], i) => (
        <div key={i} style={{
          display: 'flex', gap: 4, marginBottom: 2,
          borderRadius: 6, transition: 'background 100ms',
        }}>
          <span style={{
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem', minWidth: 28, padding: '5px 6px', flexShrink: 0,
            textAlign: 'right',
          }}>{i + 1}.</span>
          {[w, b].map((mv, j) => mv && (
            <motion.button
              key={j}
              onClick={() => onJump(i * 2 + j)}
              whileHover={{ background: 'rgba(255,255,255,0.06)' }}
              style={{
                background: currentIdx === i * 2 + j ? 'rgba(0,212,255,0.12)' : 'none',
                border: currentIdx === i * 2 + j ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                borderRadius: 6, cursor: 'pointer', flex: 1, textAlign: 'left',
                padding: '5px 8px', fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem', fontWeight: currentIdx === i * 2 + j ? 700 : 500,
                color: currentIdx === i * 2 + j ? 'var(--neon-blue)' : 'var(--text-primary)',
                transition: 'all 100ms',
              }}
            >
              {mv}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}

const TIME_CONTROLS = ['1+0', '3+0', '5+0', '10+0', '15+10', '30+0', '∞'];

export default function PlayAIPage() {
  const user = useCurrentUser();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [selectedLevel, setSelectedLevel] = useState<AILevel>(aiLevels[1]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [timeControl, setTimeControl] = useState('10+0');
  const [fen, setFen] = useState(() => new Chess().fen());
  const [chess] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(-1);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [gameResult, setGameResult] = useState<{
    result: 'win' | 'loss' | 'draw';
    reason: string;
  } | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUnlimited = timeControl === '∞';
  // DB game ID returned when backend creates the game record
  const [dbGameId, setDbGameId] = useState<string | null>(null);

  // Parse time control
  const parsedTC = timeControl === '∞' ? [0, 0] : timeControl.split('+').map(Number);
  const initialTime = parsedTC[0] * 60;
  const increment = parsedTC[1] || 0;

  const startGame = async () => {
    chess.reset();
    setFen(chess.fen());
    setMoveHistory([]);
    setCurrentMoveIdx(-1);
    setEvaluation(0);
    setGameResult(null);
    setShowGameOverModal(false);
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setGameStartTime(Date.now());
    setGameState('playing');
    setDbGameId(null);
    toast.success(`Game started vs ${selectedLevel.name} AI!`, { icon: '⚡' });

    // Create a DB record for this game so stats get saved
    if (isAuthenticated) {
      try {
        const res = await gameService.createAIGame({
          aiLevel: selectedLevel.id,
          timeControl: isUnlimited ? '99+0' : timeControl,
          playerColor,
          rated: false,
        });
        setDbGameId(res.data?.id || null);
      } catch {
        // Backend offline — stats won't be saved this game
      }
    }

    if (playerColor === 'b') {
      triggerAI(chess.fen());
    }
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    chess.reset();
    setFen(chess.fen());
    setGameState('setup');
    setMoveHistory([]);
    setCurrentMoveIdx(-1);
    setEvaluation(0);
    setGameResult(null);
    setShowGameOverModal(false);
    setIsAIThinking(false);
  };

  const endGame = useCallback((reason: string, winner: 'w' | 'b' | 'draw') => {
    if (timerRef.current) clearInterval(timerRef.current);
    const resultType: 'win' | 'loss' | 'draw' = winner === 'draw' ? 'draw' :
      winner === playerColor ? 'win' : 'loss';

    const reasonLabels: Record<string, string> = {
      checkmate: 'Checkmate',
      timeout: 'Time Out',
      resignation: 'Resignation',
      draw: 'Draw',
      stalemate: 'Stalemate',
    };

    setGameResult({ result: resultType, reason: reasonLabels[reason] || reason });
    setGameState('ended');
    setTimeout(() => setShowGameOverModal(true), 400);

    // Persist the completed game to the database
    if (isAuthenticated && dbGameId) {
      const dbResult: 'white' | 'black' | 'draw' = winner === 'draw' ? 'draw'
        : winner === 'w' ? 'white' : 'black';
      gameService.finalizeAIGame(dbGameId, {
        result: dbResult,
        pgn: chess.pgn(),
        finalFen: chess.fen(),
        moveCount: chess.history().length,
      }).catch(() => { /* Silently ignore if backend is down */ });
    }
  }, [playerColor, isAuthenticated, dbGameId, chess]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || gameResult || isUnlimited) return;
    timerRef.current = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime(t => {
          if (t <= 1) { endGame('timeout', 'b'); return 0; }
          return t - 1;
        });
      } else {
        setBlackTime(t => {
          if (t <= 1) { endGame('timeout', 'w'); return 0; }
          return t - 1;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, gameResult, chess, isUnlimited, endGame]);

  const formatTime = (secs: number) => {
    if (isUnlimited) return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getGameDuration = () => {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const triggerAI = useCallback(async (currentFen: string) => {
    setIsAIThinking(true);
    let moveStr: string | null = null;
    try {
      moveStr = await getAIMove(currentFen, selectedLevel);
    } catch (e) {
      console.warn('AI calculation error:', e);
    } finally {
      setIsAIThinking(false);
    }

    if (!moveStr || moveStr.length < 4) {
      const legal = chess.moves({ verbose: true });
      if (legal.length > 0) {
        const fallback = legal[Math.floor(Math.random() * legal.length)];
        moveStr = fallback.from + fallback.to + (fallback.promotion || '');
      } else {
        return;
      }
    }

    const from = moveStr.slice(0, 2);
    const to = moveStr.slice(2, 4);
    const promo = moveStr[4] || undefined;

    let result = null;
    try {
      result = chess.move({ from, to, promotion: promo });
    } catch {
      // In case of any unexpected move issue, fallback to first legal move
      const legal = chess.moves({ verbose: true });
      if (legal.length > 0) {
        try {
          result = chess.move(legal[0]);
        } catch {
          // Ignore
        }
      }
    }

    if (result) {
      setFen(chess.fen());
      setMoveHistory(chess.history());
      setCurrentMoveIdx(chess.history().length - 1);
      if (!isUnlimited) {
        if (playerColor === 'w') {
          setBlackTime(t => t + increment);
        } else {
          setWhiteTime(t => t + increment);
        }
      }

      // Simple evaluation update
      const historyMoves = chess.history({ verbose: true });
      const lastMove = historyMoves[historyMoves.length - 1];
      let evalDelta = (Math.random() - 0.5) * 0.3;
      if (lastMove?.captured) evalDelta -= 0.5;
      setEvaluation(prev => Math.max(-10, Math.min(10, prev + evalDelta)));

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) endGame('checkmate', chess.turn() === 'w' ? 'b' : 'w');
        else endGame('draw', 'draw');
      }
    }
  }, [chess, selectedLevel, increment, endGame, isUnlimited, playerColor]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string) => {
    if (isAIThinking) return false;
    let result = null;
    try {
      result = chess.move({ from, to, promotion });
    } catch {
      return false;
    }
    if (!result) return false;

    setFen(chess.fen());
    setMoveHistory(chess.history());
    setCurrentMoveIdx(chess.history().length - 1);
    if (!isUnlimited) {
      if (playerColor === 'w') {
        setWhiteTime(t => t + increment);
      } else {
        setBlackTime(t => t + increment);
      }
    }

    // Evaluation update
    let evalDelta = (Math.random() - 0.5) * 0.4;
    if (result.captured) evalDelta += 0.4;
    setEvaluation(prev => Math.max(-10, Math.min(10, prev + evalDelta)));

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) endGame('checkmate', playerColor);
      else endGame('draw', 'draw');
      return true;
    }

    triggerAI(chess.fen());
    return true;
  }, [chess, isAIThinking, increment, playerColor, triggerAI, endGame, isUnlimited]);

  const resign = () => {
    endGame('resignation', playerColor === 'w' ? 'b' : 'w');
  };

  // ── SETUP SCREEN ──
  if (gameState === 'setup') {
    return (
      <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(155,89,255,0.15))',
              border: '1px solid rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={24} color="var(--neon-blue)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Play vs AI</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Challenge the engine at your skill level
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* AI Difficulty */}
            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Brain size={18} color="var(--neon-violet)" /> Difficulty Level
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiLevels.map(level => (
                  <motion.button
                    key={level.id}
                    onClick={() => setSelectedLevel(level)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      padding: '14px 18px', borderRadius: 12,
                      border: `2px solid ${selectedLevel.id === level.id ? level.color : 'var(--border-subtle)'}`,
                      background: selectedLevel.id === level.id ? `${level.color}12` : 'transparent',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 200ms',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontWeight: 700,
                        color: selectedLevel.id === level.id ? level.color : 'var(--text-primary)',
                        fontSize: '0.95rem',
                      }}>
                        {level.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{level.description}</div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', color: level.color,
                      fontWeight: 700, fontSize: '0.85rem',
                      background: `${level.color}10`, padding: '4px 10px', borderRadius: 8,
                    }}>
                      ~{level.elo}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Game Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Play as */}
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Play As</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { color: 'w' as const, label: 'White', piece: '♔', sub: 'First move' },
                    { color: 'b' as const, label: 'Black', piece: '♚', sub: 'Second move' },
                  ].map(opt => (
                    <motion.button
                      key={opt.color}
                      onClick={() => setPlayerColor(opt.color)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1, padding: '20px', borderRadius: 14,
                        border: `2px solid ${playerColor === opt.color ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                        background: playerColor === opt.color ? 'rgba(0,212,255,0.08)' : 'transparent',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6, transition: 'all 200ms',
                      }}
                    >
                      <span style={{
                        fontSize: '2.2rem',
                        filter: opt.color === 'b' ? 'brightness(0.1)' : 'none',
                      }}>{opt.piece}</span>
                      <span style={{
                        fontWeight: 700, fontSize: '0.9rem',
                        color: playerColor === opt.color ? 'var(--neon-blue)' : 'var(--text-secondary)',
                      }}>{opt.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.sub}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Time Control */}
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Clock size={16} color="var(--neon-cyan)" /> Time Control
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {TIME_CONTROLS.map(tc => (
                    <motion.button
                      key={tc}
                      onClick={() => setTimeControl(tc)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '10px 8px', borderRadius: 10,
                        border: `1px solid ${timeControl === tc ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                        background: timeControl === tc ? 'rgba(0,212,255,0.1)' : 'transparent',
                        cursor: 'pointer',
                        color: timeControl === tc ? 'var(--neon-blue)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
                        transition: 'all 150ms',
                      }}
                    >
                      {tc}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <motion.button
                className="btn-primary"
                onClick={startGame}
                style={{ padding: '18px', fontSize: '1.05rem', justifyContent: 'center', width: '100%' }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={20} fill="currentColor" />
                  Start Game vs {selectedLevel.name}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── GAME SCREEN ──
  const aiColor = playerColor === 'w' ? 'b' : 'w';

  return (
    <div style={{ padding: '24px', display: 'flex', gap: 24, minHeight: '100vh', alignItems: 'flex-start' }}>
      {/* Eval Bar */}
      <div style={{ paddingTop: 48, flexShrink: 0 }}>
        <EvalBar score={evaluation} />
      </div>

      {/* Board Column */}
      <div style={{ flex: 1, maxWidth: 560 }}>
        {/* Opponent (AI) header */}
        <motion.div
          className="glass"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 18px', marginBottom: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: 12,
            borderColor: chess.turn() === aiColor ? 'rgba(0,212,255,0.2)' : 'var(--border-subtle)',
            transition: 'border-color 300ms',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `linear-gradient(135deg, ${selectedLevel.color}30, ${selectedLevel.color}10)`,
              border: `1px solid ${selectedLevel.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Stockfish AI</div>
              <div style={{
                color: selectedLevel.color, fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)', fontWeight: 600,
              }}>
                {selectedLevel.name} · ~{selectedLevel.elo}
              </div>
            </div>
            {isAIThinking && (
              <div style={{ display: 'flex', gap: 3, marginLeft: 8 }}>
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i}
                    style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--neon-blue)' }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
          </div>
          {!isUnlimited && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800,
              color: (playerColor === 'w' ? blackTime : whiteTime) < 30 ? '#FF5C5C' : 'var(--text-primary)',
              background: chess.turn() === aiColor ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.3)',
              padding: '6px 16px', borderRadius: 10,
              border: chess.turn() === aiColor ? '1px solid rgba(0,212,255,0.15)' : '1px solid transparent',
              transition: 'all 300ms',
              minWidth: 80, textAlign: 'center',
            }}>
              {formatTime(playerColor === 'w' ? blackTime : whiteTime)}
            </div>
          )}
        </motion.div>

        {/* Board */}
        <div style={{ position: 'relative' }}>
          <ChessBoard
            fen={fen}
            playerColor={playerColor}
            onMove={handlePlayerMove}
            flipped={playerColor === 'b'}
            disabled={isAIThinking || gameState === 'ended' || chess.turn() !== playerColor}
            showCoordinates
          />

          {/* AI thinking overlay */}
          <AnimatePresence>
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', bottom: -44, left: 0, right: 0,
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Gauge size={16} color="var(--neon-blue)" />
                </motion.div>
                <span style={{
                  color: 'var(--neon-blue)', fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>
                  Analyzing at depth {selectedLevel.depth}…
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player header */}
        <motion.div
          className="glass"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 18px', marginTop: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: 12,
            borderColor: chess.turn() === playerColor ? 'rgba(0,212,255,0.2)' : 'var(--border-subtle)',
            transition: 'border-color 300ms',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="avatar-placeholder" style={{
              width: 38, height: 38, fontSize: '0.9rem', textTransform: 'uppercase',
              borderRadius: 12,
            }}>
              {user.username.substring(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.username}</div>
              <div style={{
                color: 'var(--neon-blue)', fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)', fontWeight: 600,
              }}>⚡ {user.rating}</div>
            </div>
          </div>
          {!isUnlimited && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800,
              color: (playerColor === 'w' ? whiteTime : blackTime) < 30 ? '#FF5C5C' : 'var(--text-primary)',
              background: chess.turn() === playerColor ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.3)',
              padding: '6px 16px', borderRadius: 10,
              border: chess.turn() === playerColor ? '1px solid rgba(0,212,255,0.15)' : '1px solid transparent',
              transition: 'all 300ms',
              minWidth: 80, textAlign: 'center',
            }}>
              {formatTime(playerColor === 'w' ? whiteTime : blackTime)}
            </div>
          )}
        </motion.div>
      </div>

      {/* Side Panel */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
        {/* Controls */}
        <div className="glass" style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <motion.button
              className="btn-ghost btn-sm"
              onClick={resetGame}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ justifyContent: 'center' }}
            >
              <RotateCcw size={14} /> New
            </motion.button>
            <motion.button
              onClick={resign}
              disabled={gameState === 'ended'}
              whileHover={{ scale: gameState !== 'ended' ? 1.03 : 1 }}
              whileTap={{ scale: gameState !== 'ended' ? 0.97 : 1 }}
              style={{
                padding: '8px 16px', borderRadius: 10,
                border: '1px solid rgba(255,92,92,0.4)',
                background: 'transparent', color: '#FF5C5C', cursor: 'pointer',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                gap: 6, justifyContent: 'center', fontWeight: 600,
                opacity: gameState === 'ended' ? 0.4 : 1,
              }}
            >
              <Flag size={14} /> Resign
            </motion.button>
          </div>

          {/* Inline result */}
          <AnimatePresence>
            {gameResult && !showGameOverModal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  padding: '12px', borderRadius: 10, textAlign: 'center', marginTop: 10,
                  background: gameResult.result === 'win'
                    ? 'linear-gradient(135deg, rgba(0,245,80,0.1), rgba(0,212,255,0.08))'
                    : gameResult.result === 'loss'
                      ? 'linear-gradient(135deg, rgba(255,92,92,0.1), rgba(255,0,128,0.08))'
                      : 'rgba(255,200,0,0.08)',
                  border: `1px solid ${
                    gameResult.result === 'win' ? 'rgba(0,245,80,0.2)' :
                    gameResult.result === 'loss' ? 'rgba(255,92,92,0.2)' : 'rgba(255,200,0,0.2)'
                  }`,
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
                onClick={() => setShowGameOverModal(true)}
              >
                {gameResult.result === 'win' ? '🏆 ' : gameResult.result === 'loss' ? '💀 ' : '🤝 '}
                {gameResult.result.charAt(0).toUpperCase() + gameResult.result.slice(1)} — {gameResult.reason}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Info */}
        <div className="glass" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bot size={16} color="var(--neon-blue)" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Engine Info</span>
          </div>
          {[
            { label: 'Evaluation', value: evaluation >= 0 ? `+${evaluation.toFixed(2)}` : evaluation.toFixed(2), color: evaluation >= 0 ? '#00F550' : '#FF5C5C' },
            { label: 'Depth', value: `${selectedLevel.depth} ply`, color: 'var(--neon-violet)' },
            { label: 'Level', value: selectedLevel.name, color: selectedLevel.color },
            { label: 'Turn', value: chess.turn() === 'w' ? 'White' : 'Black', color: chess.turn() === 'w' ? '#F0F0F0' : '#888' },
            { label: 'Moves', value: `${moveHistory.length}`, color: 'var(--neon-cyan)' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ color: item.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Move History */}
        <div className="glass" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Moves</span>
            <span style={{
              background: 'rgba(0,212,255,0.1)', color: 'var(--neon-blue)',
              padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              border: '1px solid rgba(0,212,255,0.15)',
            }}>{moveHistory.length}</span>
          </div>
          <MoveHistory
            moves={moveHistory}
            currentIdx={currentMoveIdx}
            onJump={setCurrentMoveIdx}
          />
        </div>
      </div>

      {/* Game Over Modal */}
      {gameResult && (
        <GameOverModal
          visible={showGameOverModal}
          result={gameResult.result}
          reason={gameResult.reason}
          opponent={`${selectedLevel.name} AI (~${selectedLevel.elo})`}
          playerColor={playerColor}
          stats={{
            moveCount: moveHistory.length,
            duration: getGameDuration(),
          }}
          onNewGame={resetGame}
          onRematch={startGame}
          onClose={() => setShowGameOverModal(false)}
        />
      )}
    </div>
  );
}
