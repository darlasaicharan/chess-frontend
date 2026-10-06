import { useState } from 'react';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
import ChessBoard from '../components/chess/ChessBoard';
import { mockPuzzles } from '../data/mockData';
import { Target, CheckCircle, XCircle, HelpCircle, Flame, Star, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Puzzle } from '../types';

const difficultyColor: Record<string, string> = {
  easy: '#00F550',
  medium: '#FFC800',
  hard: '#FF6B6B',
};

function PuzzleCard({ puzzle, onSelect, active }: { puzzle: Puzzle; onSelect: () => void; active: boolean }) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      style={{
        padding: '16px', borderRadius: 12, cursor: 'pointer', transition: 'all 200ms',
        background: active ? 'rgba(0,212,255,0.1)' : 'var(--bg-card)',
        border: `1px solid ${active ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{puzzle.title}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="badge" style={{ background: `${difficultyColor[puzzle.difficulty]}18`, color: difficultyColor[puzzle.difficulty], border: `1px solid ${difficultyColor[puzzle.difficulty]}40`, fontSize: '0.7rem' }}>
          {puzzle.difficulty.toUpperCase()}
        </span>
        <span style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>★ {puzzle.rating}</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {puzzle.themes.map(t => (
          <span key={t} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--border-subtle)', padding: '2px 6px', borderRadius: 4 }}>{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

export default function PuzzlesPage() {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle>(mockPuzzles[0]);
  const [chess] = useState(() => new Chess(mockPuzzles[0].fen));
  const [currentFen, setCurrentFen] = useState(mockPuzzles[0].fen);
  const [solutionIdx, setSolutionIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail' | 'hint'>('idle');
  const [streak, setStreak] = useState(7);
  const [solved, setSolved] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const loadPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    chess.load(puzzle.fen);
    setCurrentFen(puzzle.fen);
    setSolutionIdx(0);
    setStatus('idle');
    setHintsUsed(0);
  };

  const handleMove = (_from: string, to: string) => {
    const expected = activePuzzle.solution[solutionIdx];
    const move = chess.history({ verbose: true }).at(-1);

    if (move && (move.san === expected || move.to === to)) {
      const next = solutionIdx + 1;
      setCurrentFen(chess.fen());
      setSolutionIdx(next);

      if (next >= activePuzzle.solution.length) {
        setStatus('success');
        setSolved(s => s + 1);
        setStreak(s => s + 1);
        toast.success('🎉 Puzzle solved!');
      }
    } else {
      setStatus('fail');
      toast.error('Wrong move! Try again.', { duration: 2000 });
      setTimeout(() => {
        chess.load(activePuzzle.fen);
        setCurrentFen(activePuzzle.fen);
        setSolutionIdx(0);
        setStatus('idle');
      }, 1500);
    }
    return true;
  };

  const showHint = () => {
    const hint = activePuzzle.solution[solutionIdx];
    setHintsUsed(h => h + 1);
    setStatus('hint');
    toast(`💡 Hint: Look for ${hint.slice(0, 1)} moves`, { duration: 3000 });
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Target size={28} color="var(--neon-blue)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Chess Puzzles</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Sharpen your tactical vision with curated puzzles</p>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { icon: <Flame size={16} color="#FF6B35" />, label: 'Streak', value: streak },
            { icon: <CheckCircle size={16} color="#00F550" />, label: 'Solved Today', value: solved },
            { icon: <Brain size={16} color="var(--neon-violet)" />, label: 'Puzzle Rating', value: 1487 + solved * 3 },
            { icon: <Star size={16} color="#FFC800" />, label: 'Accuracy', value: '78%' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
              {s.icon}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Board + Controls */}
          <div>
            {/* Puzzle info */}
            <div className="glass" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{activePuzzle.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activePuzzle.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge" style={{ background: `${difficultyColor[activePuzzle.difficulty]}18`, color: difficultyColor[activePuzzle.difficulty], border: `1px solid ${difficultyColor[activePuzzle.difficulty]}40` }}>
                  {activePuzzle.difficulty.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ★ {activePuzzle.rating}
                </span>
              </div>
            </div>

            {/* Status banner */}
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 16px', borderRadius: 10, marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center',
                  background: status === 'success' ? 'rgba(0,245,80,0.1)' : status === 'fail' ? 'rgba(255,92,92,0.1)' : 'rgba(0,212,255,0.1)',
                  border: `1px solid ${status === 'success' ? 'rgba(0,245,80,0.3)' : status === 'fail' ? 'rgba(255,92,92,0.3)' : 'rgba(0,212,255,0.3)'}`,
                }}
              >
                {status === 'success' && <CheckCircle size={18} color="#00F550" />}
                {status === 'fail' && <XCircle size={18} color="#FF5C5C" />}
                {status === 'hint' && <HelpCircle size={18} color="var(--neon-blue)" />}
                <span style={{ fontWeight: 600 }}>
                  {status === 'success' && '🎉 Excellent! You solved the puzzle!'}
                  {status === 'fail' && '❌ Wrong move — resetting...'}
                  {status === 'hint' && `💡 Move ${solutionIdx + 1} of ${activePuzzle.solution.length} — think carefully!`}
                </span>
              </motion.div>
            )}

            <ChessBoard
              fen={currentFen}
              playerColor="w"
              onMove={handleMove}
              disabled={status === 'success'}
              showCoordinates
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={showHint} className="btn-ghost btn-sm" style={{ gap: 6 }}>
                <HelpCircle size={14} /> Hint {hintsUsed > 0 ? `(${hintsUsed})` : ''}
              </button>
              <button onClick={() => loadPuzzle(activePuzzle)} className="btn-ghost btn-sm" style={{ gap: 6, color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
                ↺ Reset
              </button>
              {status === 'success' && (
                <button
                  onClick={() => loadPuzzle(mockPuzzles[(mockPuzzles.indexOf(activePuzzle) + 1) % mockPuzzles.length])}
                  className="btn-primary btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  Next Puzzle →
                </button>
              )}
            </div>
          </div>

          {/* Puzzle List */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, color: 'var(--text-secondary)' }}>Available Puzzles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockPuzzles.map(p => (
                <PuzzleCard
                  key={p.id}
                  puzzle={p}
                  onSelect={() => loadPuzzle(p)}
                  active={activePuzzle.id === p.id}
                />
              ))}

              {/* Daily puzzle card */}
              <div style={{
                padding: '20px', borderRadius: 14, marginTop: 8,
                background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(155,89,255,0.1))',
                border: '1px solid rgba(0,212,255,0.2)',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌟</div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>Daily Puzzle</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 12 }}>
                  Solve today's featured puzzle for bonus streak points
                </div>
                <button onClick={() => loadPuzzle(mockPuzzles[2])} className="btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Solve Daily Puzzle
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
