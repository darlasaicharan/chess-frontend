import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
import { useParams, Link } from 'react-router-dom';
import {
  Brain, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Play, Pause, Download, Copy, Share2, Sparkles, CheckCircle2,
  AlertTriangle, XCircle, ArrowUpRight, Zap, Target
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ChessBoard from '../components/chess/ChessBoard';
import { mockGames, currentUser } from '../data/mockData';
import { gameService } from '../services/api';
import toast from 'react-hot-toast';

interface MoveAnalysis {
  san: string;
  from: string;
  to: string;
  fen: string;
  score: number; // Centipawn or mate (e.g., +1.5)
  classification: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  bestMoveSan?: string;
  engineComment: string;
  pv: string[];
}

export default function GameAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [realGame, setRealGame] = useState<any>(null);

  useEffect(() => {
    if (id) {
      gameService.getGame(id)
        .then(res => { if (res.data) setRealGame(res.data); })
        .catch(() => {});
    }
  }, [id]);

  const game = realGame || mockGames.find(g => g.id === id) || mockGames[0];

  // Synthesize sample realistic moves for analysis
  const analyzedMoves: MoveAnalysis[] = useMemo(() => {
    const rawMoves = [
      { san: 'e4', from: 'e2', to: 'e4', score: 0.2, classification: 'best', comment: 'Controls central squares and frees queen and bishop.' },
      { san: 'c5', from: 'c7', to: 'c5', score: 0.1, classification: 'best', comment: 'Sicilian Defense — fighting asymmetrically for the center.' },
      { san: 'Nf3', from: 'g1', to: 'f3', score: 0.25, classification: 'best', comment: 'Standard opening development.' },
      { san: 'd6', from: 'd7', to: 'd6', score: 0.2, classification: 'excellent', comment: 'Solid foundation for Sicilian Najdorf/Dragon.' },
      { san: 'd4', from: 'd2', to: 'd4', score: 0.3, classification: 'best', comment: 'Open Sicilian — opens center lines for rapid initiative.' },
      { san: 'cxd4', from: 'c5', to: 'd4', score: 0.28, classification: 'best', comment: 'Natural pawn capture.' },
      { san: 'Nxd4', from: 'f3', to: 'd4', score: 0.3, classification: 'best', comment: 'Recapturing with knight dominance.' },
      { san: 'Nf6', from: 'g8', to: 'f6', score: 0.22, classification: 'best', comment: 'Attacking e4 and developing knight.' },
      { san: 'Nc3', from: 'b1', to: 'c3', score: 0.35, classification: 'best', comment: 'Defending e4 smoothly.' },
      { san: 'a6', from: 'a7', to: 'a6', score: 0.3, classification: 'great', comment: 'Najdorf signature — preventing Bb5+ & Nb5.' },
      { san: 'Bg5', from: 'c1', to: 'g5', score: 0.4, classification: 'best', comment: 'Mainline sharp aggressive attack.' },
      { san: 'e6', from: 'e7', to: 'e6', score: 0.38, classification: 'best', comment: 'Blunts the bishop line.' },
      { san: 'f4', from: 'f2', to: 'f4', score: 0.5, classification: 'best', comment: 'Aggressive kingside pawn storm setup.' },
      { san: 'Be7', from: 'f8', to: 'e7', score: 0.45, classification: 'good', comment: 'Solid preparation for kingside castling.' },
      { san: 'Qf3', from: 'd1', to: 'f3', score: 0.6, classification: 'best', comment: 'Queen joins the attack and prepares queenside castling.' },
      { san: 'Qc7', from: 'd8', to: 'c7', score: 0.55, classification: 'good', comment: 'Controlling c-file and queenside pressure.' },
      { san: 'O-O-O', from: 'e1', to: 'c1', score: 0.7, classification: 'best', comment: 'Opposite side castling — tactical battle begins!' },
      { san: 'Nbd7', from: 'b8', to: 'd7', score: 0.6, classification: 'excellent', comment: 'Coordinating knights for c5/e5.' },
      { san: 'g4', from: 'g2', to: 'g4', score: 0.85, classification: 'great', comment: 'Pawn thrust opening lines on the kingside.' },
      { san: 'b5', from: 'b7', to: 'b5', score: 0.75, classification: 'good', comment: 'Counterattack on the queenside.' },
      { san: 'Bxf6', from: 'g5', to: 'f6', score: 1.1, classification: 'best', comment: 'Damaging black pawn structure or piece activity.' },
      { san: 'Nxf6', from: 'd7', to: 'f6', score: 1.05, classification: 'best', comment: 'Knight recaptures to maintain kingside defense.' },
      { san: 'g5', from: 'g4', to: 'g5', score: 1.45, classification: 'best', comment: 'Displacing the defender of the kingside.' },
      { san: 'Nd7', from: 'f6', to: 'd7', score: 1.6, classification: 'good', comment: 'Forced retreat.' },
      { san: 'a3', from: 'a2', to: 'a3', score: 0.9, classification: 'inaccuracy', bestMoveSan: 'f5!', comment: 'Slightly slow. Stockfish preferred 25. f5! breaking open lines.' },
      { san: 'Rb8', from: 'a8', to: 'b8', score: 1.1, classification: 'good', comment: 'Lining up on the b-file.' },
      { san: 'f5', from: 'f4', to: 'f5', score: 2.3, classification: 'brilliant', comment: 'Sacrificial pawn break! Smashes open black king shelter.', bestMoveSan: 'f5!!' },
      { san: 'exf5', from: 'e6', to: 'f5', score: 3.2, classification: 'mistake', bestMoveSan: 'Ne5', comment: 'Capturing opens d-file and bishop diagon. 28... Ne5 was more resilient.' },
      { san: 'Nd5', from: 'c3', to: 'd5', score: 4.8, classification: 'brilliant', comment: 'Monster outpost leap threatening Qd8 and fork on c7!', bestMoveSan: 'Nd5!!' },
      { san: 'Qd8', from: 'c7', to: 'd8', score: 5.4, classification: 'good', comment: 'Fleeing the fork.' },
      { san: 'exf5', from: 'e4', to: 'f5', score: 6.2, classification: 'best', comment: 'Total domination in center files.' },
      { san: 'Bb7', from: 'c8', to: 'b7', score: 7.9, classification: 'blunder', bestMoveSan: 'O-O', comment: 'Critical blunder in time trouble! Allows unstoppable tactical barrage.' },
      { san: 'Re1+', from: 'd1', to: 'e1', score: 9.8, classification: 'best', comment: 'Decisive king check trapping black king in center.' },
    ];

    const c = new Chess();
    const result: MoveAnalysis[] = [];

    rawMoves.forEach((m) => {
      try {
        c.move(m.san);
        result.push({
          san: m.san,
          from: m.from,
          to: m.to,
          fen: c.fen(),
          score: m.score,
          classification: m.classification as any,
          bestMoveSan: m.bestMoveSan,
          engineComment: m.comment,
          pv: [m.san, 'Nf3', 'Be7', 'O-O']
        });
      } catch {
        // Fallback
      }
    });

    return result;
  }, []);

  const [currentIdx, setCurrentIdx] = useState<number>(analyzedMoves.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [engineDepth, setEngineDepth] = useState<number>(24);

  const activeMove = analyzedMoves[currentIdx] || analyzedMoves[0];

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= analyzedMoves.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, analyzedMoves.length]);

  // Chart data
  const chartData = analyzedMoves.map((m, i) => ({
    move: Math.floor(i / 2) + 1 + (i % 2 === 0 ? 'w' : 'b'),
    eval: Math.max(-10, Math.min(10, m.score * (i % 2 === 0 ? 1 : -1))),
    rawScore: m.score,
    san: m.san,
    idx: i
  }));

  const classificationConfig = {
    brilliant: { label: 'Brilliant', color: '#00F5FF', icon: '!!', bg: 'rgba(0,245,255,0.15)' },
    great: { label: 'Great Move', color: '#5C8AFF', icon: '!', bg: 'rgba(92,138,255,0.15)' },
    best: { label: 'Best Move', color: '#00F5A0', icon: '★', bg: 'rgba(0,245,160,0.15)' },
    excellent: { label: 'Excellent', color: '#4ADE80', icon: '✓', bg: 'rgba(74,222,128,0.12)' },
    good: { label: 'Good', color: '#A3E635', icon: '·', bg: 'rgba(163,230,53,0.1)' },
    inaccuracy: { label: 'Inaccuracy', color: '#FACC15', icon: '?!', bg: 'rgba(250,204,21,0.12)' },
    mistake: { label: 'Mistake', color: '#FB923C', icon: '?', bg: 'rgba(251,146,60,0.15)' },
    blunder: { label: 'Blunder', color: '#F87171', icon: '??', bg: 'rgba(248,113,113,0.2)' },
  };

  const whiteCounts = { brilliant: 2, great: 2, best: 11, excellent: 1, good: 1, inaccuracy: 1, mistake: 0, blunder: 0 };
  const blackCounts = { brilliant: 0, great: 1, best: 7, excellent: 1, good: 3, inaccuracy: 0, mistake: 1, blunder: 1 };

  return (
    <div style={{ padding: '24px 36px', maxWidth: 1350, margin: '0 auto' }}>
      {/* Top Navigation & Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/history" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: '0.85rem' }}>
              <ChevronLeft size={16} /> Game History
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="badge badge-blue">Stockfish 17.1 NNUE</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {game.white.username} ({game.white.rating}) <span style={{ color: 'var(--text-muted)' }}>vs</span> {game.black.username} ({game.black.rating})
          </h1>
          <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            <span>ECO: <strong>B90 Sicilian Defense: Najdorf</strong></span>
            <span>•</span>
            <span>Result: <strong style={{ color: '#00F5A0' }}>{game.result}</strong></span>
            <span>•</span>
            <span>{game.timeControl}</span>
            <span>•</span>
            <span>{game.date}</span>
          </div>
        </div>

        {/* Share & Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeMove.fen);
              toast.success('Current FEN copied to clipboard!');
            }}
            className="btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Copy size={14} /> Copy FEN
          </button>
          <button
            onClick={() => toast.success('PGN downloaded successfully!')}
            className="btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> PGN
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Analysis link copied!');
            }}
            className="btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Accuracy Header Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* White accuracy */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #00D4FF' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WHITE ACCURACY</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{game.white.username}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)' }}>94.8%</span>
          </div>
        </div>

        {/* Black accuracy */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #FF5C5C' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>BLACK ACCURACY</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{game.black.username}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FF7A45', fontFamily: 'var(--font-mono)' }}>79.2%</span>
          </div>
        </div>

        {/* Engine status */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #9B59FF' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ANALYSIS ENGINE</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Depth {engineDepth} · NNUE Active</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[18, 24, 30].map(d => (
              <button
                key={d}
                onClick={() => {
                  setEngineDepth(d);
                  toast.success(`Recalculating with Depth ${d}`);
                }}
                className={`btn-sm ${engineDepth === d ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                D{d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 580px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Board & Engine Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
            {/* Live Centipawn Eval Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: activeMove.score >= 0 ? '#00D4FF' : '#FF5C5C' }}>
                {activeMove.score >= 0 ? `+${activeMove.score.toFixed(1)}` : activeMove.score.toFixed(1)}
              </span>
              <div style={{ width: 16, height: 460, background: '#111827', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: activeMove.score >= 0 ? 'linear-gradient(0deg, #00D4FF, #ffffff)' : '#374151',
                    borderRadius: '6px 6px 0 0'
                  }}
                  animate={{
                    height: `${Math.max(10, Math.min(90, 50 + activeMove.score * 5))}%`
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>EVAL</span>
            </div>

            {/* Board */}
            <ChessBoard
              fen={activeMove.fen}
              lastMove={{ from: activeMove.from, to: activeMove.to }}
              disabled={true}
            />
          </div>

          {/* Stepper Controls */}
          <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setCurrentIdx(0)}
                disabled={currentIdx === 0}
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setCurrentIdx(c => Math.max(0, c - 1))}
                disabled={currentIdx === 0}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={`btn-sm ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setCurrentIdx(c => Math.min(analyzedMoves.length - 1, c + 1))}
                disabled={currentIdx === analyzedMoves.length - 1}
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setCurrentIdx(analyzedMoves.length - 1)}
                disabled={currentIdx === analyzedMoves.length - 1}
              >
                <ChevronsRight size={16} />
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Move {Math.floor(currentIdx / 2) + 1} / {Math.ceil(analyzedMoves.length / 2)}
            </div>
          </div>
        </div>

        {/* Right: Engine Breakdown & Evaluation Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Move Commentary Box */}
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: 22,
              borderLeft: `5px solid ${classificationConfig[activeMove.classification].color}`,
              background: classificationConfig[activeMove.classification].bg
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '1rem',
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: classificationConfig[activeMove.classification].color,
                    color: '#050814'
                  }}
                >
                  {classificationConfig[activeMove.classification].icon} {classificationConfig[activeMove.classification].label}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {Math.floor(currentIdx / 2) + 1}{currentIdx % 2 === 0 ? '.' : '...'} {activeMove.san}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: activeMove.score >= 0 ? 'var(--neon-blue)' : '#FF5C5C' }}>
                Eval: {activeMove.score >= 0 ? `+${activeMove.score.toFixed(1)}` : activeMove.score.toFixed(1)}
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#fff', lineHeight: 1.5, marginBottom: 12 }}>
              {activeMove.engineComment}
            </p>

            {activeMove.bestMoveSan && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                <Sparkles size={15} color="#00F5A0" />
                <span>Engine Recommendation:</span>
                <strong style={{ color: '#00F5A0', fontFamily: 'var(--font-mono)' }}>{activeMove.bestMoveSan}</strong>
              </div>
            )}
          </motion.div>

          {/* Advantage Evaluation Chart */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="var(--neon-blue)" /> Evaluation Timeline
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click points to jump move</span>
            </div>

            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setCurrentIdx(e.activePayload[0].payload.idx);
                  }
                }}>
                  <defs>
                    <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="move" stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <YAxis domain={[-10, 10]} hide />
                  <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ background: '#0d1528', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, fontSize: '0.8rem' }}
                    formatter={(val: any, _name: any, item: any) => [`${val >= 0 ? '+' : ''}${item.payload.rawScore.toFixed(1)} (${item.payload.san})`, 'Evaluation']}
                  />
                  <Area type="monotone" dataKey="eval" stroke="#00D4FF" fillOpacity={1} fill="url(#evalGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Move Accuracy Breakdown Summary */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Move Classification Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.entries(classificationConfig).map(([key, cfg]) => {
                const wCount = (whiteCounts as any)[key] || 0;
                const bCount = (blackCounts as any)[key] || 0;
                return (
                  <div key={key} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 700, marginBottom: 2 }}>{cfg.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#fff' }}>{wCount}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/</span>
                      <span style={{ color: 'var(--text-muted)' }}>{bCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notation List to Jump */}
          <div className="glass-card" style={{ padding: 18, maxHeight: 180, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr', gap: '4px 10px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              {Array.from({ length: Math.ceil(analyzedMoves.length / 2) }).map((_, i) => {
                const wMove = analyzedMoves[i * 2];
                const bMove = analyzedMoves[i * 2 + 1];
                return (
                  <div key={i} style={{ display: 'contents' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                    <button
                      onClick={() => setCurrentIdx(i * 2)}
                      style={{
                        textAlign: 'left',
                        padding: '3px 6px',
                        borderRadius: 4,
                        border: 'none',
                        cursor: 'pointer',
                        background: currentIdx === i * 2 ? 'rgba(0,212,255,0.2)' : 'transparent',
                        color: currentIdx === i * 2 ? '#00D4FF' : '#fff',
                        fontWeight: currentIdx === i * 2 ? 800 : 500
                      }}
                    >
                      {wMove ? `${wMove.san} ${classificationConfig[wMove.classification].icon}` : ''}
                    </button>
                    {bMove ? (
                      <button
                        onClick={() => setCurrentIdx(i * 2 + 1)}
                        style={{
                          textAlign: 'left',
                          padding: '3px 6px',
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                          background: currentIdx === i * 2 + 1 ? 'rgba(0,212,255,0.2)' : 'transparent',
                          color: currentIdx === i * 2 + 1 ? '#00D4FF' : '#fff',
                          fontWeight: currentIdx === i * 2 + 1 ? 800 : 500
                        }}
                      >
                        {bMove.san} {classificationConfig[bMove.classification].icon}
                      </button>
                    ) : <span />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
