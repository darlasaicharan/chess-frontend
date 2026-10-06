import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import {
  Brain, Target, Sparkles, CheckCircle2, RotateCcw, Lightbulb,
  Award, ArrowRight, BookOpen, Zap, HelpCircle, Trophy
} from 'lucide-react';
import ChessBoard from '../components/chess/ChessBoard';
import toast from 'react-hot-toast';

interface Drill {
  id: string;
  category: 'tactics' | 'endgame' | 'blunder_shield' | 'visualization';
  title: string;
  subtitle: string;
  fen: string;
  solution: string[]; // SAN moves
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
}

const DRILLS: Drill[] = [
  {
    id: '1',
    category: 'endgame',
    title: 'The Lucena Position (Rook Endgame)',
    subtitle: 'Build the bridge: Win the rook and pawn endgame as White',
    fen: '1K1R4/8/1P1k4/8/8/8/8/2r5 w - - 0 1',
    solution: ['Rd4', 'Ke7', 'Re4+', 'Kd6', 'Re5'],
    explanation: 'The classic "bridge building" maneuver! White checks the black king away and creates a rook shield on the 4th/5th rank so the pawn can safely promote.',
    difficulty: 'Intermediate'
  },
  {
    id: '2',
    category: 'tactics',
    title: 'Smothered Mate Pattern',
    subtitle: 'Trap the black king in his own defensive blockade',
    fen: '6k1/5ppp/8/8/8/1Q6/5PPP/4N1K1 w - - 0 1',
    solution: ['Qb8#'],
    explanation: 'Back rank coordination! The king is completely hemmed in by his own pawns.',
    difficulty: 'Beginner'
  },
  {
    id: '3',
    category: 'tactics',
    title: 'Greek Gift Sacrifice (Bxh7+)',
    subtitle: 'Crack open the classical castle formation',
    fen: 'r1bq1rk1/ppp2ppp/2np4/2b1p3/2B1P1n1/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1',
    solution: ['Bxf7+', 'Rxf7'],
    explanation: 'A devastating bishop sacrifice that strips the opponent king bare for queen and knight hunting.',
    difficulty: 'Master'
  },
  {
    id: '4',
    category: 'blunder_shield',
    title: 'Defend the Hanging Knight',
    subtitle: 'Identify the invisible tactic before advancing',
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2NP1N2/PPP1BPPP/R1BQK2R w KQkq - 0 6',
    solution: ['dxe4'],
    explanation: 'Winning the hanging piece while breaking the pin against c3.',
    difficulty: 'Intermediate'
  }
];

export default function TrainingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const drill = DRILLS[currentDrillIndex];

  const [chess, setChess] = useState(() => new Chess(drill.fen));
  const [fen, setFen] = useState(drill.fen);
  const [moveStep, setMoveStep] = useState(0);
  const [status, setStatus] = useState<'thinking' | 'correct' | 'wrong'>('thinking');
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(3);

  const resetDrill = (newDrill?: Drill) => {
    const target = newDrill || drill;
    const c = new Chess(target.fen);
    setChess(c);
    setFen(target.fen);
    setMoveStep(0);
    setStatus('thinking');
    setShowHint(false);
  };

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (status === 'correct') return false;

    try {
      const move = chess.move({ from: from as any, to: to as any, promotion: (promotion as any) || 'q' });
      if (!move) return false;

      // Check if matches solution
      const expected = drill.solution[moveStep];
      if (move.san === expected || move.from + move.to === expected) {
        setFen(chess.fen());
        const nextStep = moveStep + 1;
        setMoveStep(nextStep);

        if (nextStep >= drill.solution.length) {
          setStatus('correct');
          setStreak(s => s + 1);
          toast.success('Outstanding! Drill Completed!', { icon: '🎯' });
        } else {
          // Play opponent response in solution if available
          setTimeout(() => {
            const oppMoveSan = drill.solution[nextStep];
            if (oppMoveSan) {
              chess.move(oppMoveSan);
              setFen(chess.fen());
              setMoveStep(nextStep + 1);
            }
          }, 500);
        }
        return true;
      } else {
        // Wrong move
        chess.undo();
        setStatus('wrong');
        toast.error('Not the most accurate move. Try again!', { icon: '❌' });
        return false;
      }
    } catch {
      return false;
    }
  };

  const nextDrill = () => {
    const nextIdx = (currentDrillIndex + 1) % DRILLS.length;
    setCurrentDrillIndex(nextIdx);
    resetDrill(DRILLS[nextIdx]);
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: 1250, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Brain size={28} color="var(--neon-purple)" style={{ filter: 'drop-shadow(0 0 10px rgba(155,89,255,0.6))' }} />
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Training Center</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Master advanced tactics, endgame theorems, and blunder prevention with live AI feedback.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}>
            <Zap size={14} color="#FFC800" />
            <span>Streak: <strong>{streak} Correct</strong></span>
          </div>
          <div className="badge badge-blue" style={{ padding: '8px 14px' }}>
            Tactical Elo: <strong>2,140</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Modules' },
          { id: 'endgame', label: 'Endgame Precision' },
          { id: 'tactics', label: 'Tactics & Sacrifices' },
          { id: 'blunder_shield', label: 'Blunder Shield' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 20 }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Training Sandbox */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 560px) 1fr', gap: 28, alignItems: 'start' }}>
        {/* Interactive Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChessBoard
              fen={fen}
              onMove={handleMove}
              disabled={status === 'correct'}
            />
          </div>

          {/* Quick Board Tools */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => resetDrill()}
              className="btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={14} /> Reset Position
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              className="btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFC800' }}
            >
              <Lightbulb size={14} /> {showHint ? 'Hide Hint' : 'Get Hint'}
            </button>

            <button
              onClick={nextDrill}
              className="btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Next Drill <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Drill Mission & Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <motion.div
            key={drill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: 26, borderLeft: '4px solid var(--neon-purple)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{drill.category}</span>
              <span className="badge badge-yellow">{drill.difficulty}</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>{drill.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 18 }}>
              {drill.subtitle}
            </p>

            {/* Hint Box */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255,200,0,0.08)',
                    border: '1px solid rgba(255,200,0,0.3)',
                    color: '#FFC800',
                    fontSize: '0.88rem',
                    marginBottom: 16
                  }}
                >
                  💡 <strong>Hint:</strong> Look for the first move starting with: <strong>{drill.solution[0][0]}</strong>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success state */}
            {status === 'correct' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: 'rgba(0,245,160,0.1)',
                  border: '1px solid #00F5A0',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00F5A0', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>
                  <CheckCircle2 size={20} /> Puzzle Solved Perfectly!
                </div>
                <p style={{ fontSize: '0.88rem', color: '#fff', lineHeight: 1.5 }}>
                  {drill.explanation}
                </p>
              </motion.div>
            )}

            {/* Drill Progress Steps */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Solution Progress</span>
                <span>{moveStep} / {drill.solution.length} moves</span>
              </div>
              <div style={{ height: 6, background: '#1a2744', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--neon-purple), var(--neon-blue))',
                    width: `${(moveStep / drill.solution.length) * 100}%`,
                    transition: 'width 300ms ease'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Drill Syllabus Overview */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} color="var(--neon-blue)" /> Daily Training Syllabus
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DRILLS.map((d, i) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setCurrentDrillIndex(i);
                    resetDrill(d);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: currentDrillIndex === i ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${currentDrillIndex === i ? 'var(--neon-blue)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 150ms'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.difficulty} · {d.category}</div>
                  </div>
                  {i < currentDrillIndex ? (
                    <CheckCircle2 size={16} color="#00F5A0" />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
