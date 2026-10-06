import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import type { Square } from 'chess.js';
import { useUIStore } from '../../store';

interface ChessBoardProps {
  fen?: string;
  playerColor?: 'w' | 'b';
  onMove?: (from: string, to: string, promotion?: string) => boolean;
  flipped?: boolean;
  disabled?: boolean;
  lastMove?: { from: string; to: string };
  highlightSquares?: string[];
  showCoordinates?: boolean;
  size?: number;
  interactive?: boolean;
}

// Unicode chess pieces
const PIECES: Record<string, string> = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

// Board colors per theme
const THEMES: Record<string, { light: string; dark: string; border: string; glow: string; selected: string; lastMove: string }> = {
  cyber: {
    light: '#1a2744', dark: '#0d1528',
    border: 'rgba(0,212,255,0.3)', glow: '0 0 40px rgba(0,212,255,0.1)',
    selected: 'rgba(0,212,255,0.35)', lastMove: 'rgba(155,89,255,0.25)',
  },
  neon: {
    light: '#1a1a2e', dark: '#0a0a1a',
    border: 'rgba(155,89,255,0.4)', glow: '0 0 40px rgba(155,89,255,0.15)',
    selected: 'rgba(155,89,255,0.35)', lastMove: 'rgba(0,212,255,0.25)',
  },
  midnight: {
    light: '#1a1a2e', dark: '#0d0d1f',
    border: 'rgba(0,245,212,0.3)', glow: '0 0 40px rgba(0,245,212,0.1)',
    selected: 'rgba(0,245,212,0.35)', lastMove: 'rgba(155,89,255,0.2)',
  },
  classic: {
    light: '#f0d9b5', dark: '#b58863',
    border: 'rgba(181,136,99,0.5)', glow: '0 4px 20px rgba(0,0,0,0.4)',
    selected: 'rgba(255,215,0,0.45)', lastMove: 'rgba(205,210,106,0.5)',
  },
  emerald: {
    light: '#1e3b2e', dark: '#0f1e17',
    border: 'rgba(0,200,100,0.3)', glow: '0 0 40px rgba(0,200,100,0.08)',
    selected: 'rgba(0,200,100,0.35)', lastMove: 'rgba(0,200,100,0.2)',
  },
};

// ── Sound System ──
function playSynthSound(type: 'move' | 'capture' | 'check' | 'castle' | 'promote') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'move':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        osc.start(); osc.stop(ctx.currentTime + 0.07);
        break;
      case 'capture':
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.start(); osc.stop(ctx.currentTime + 0.14);
        break;
      case 'check': {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.07);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
      }
      case 'castle':
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
        break;
      case 'promote':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.16, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
    }
  } catch { /* Audio not available */ }
}

// ── Promotion Dialog ──
function PromotionDialog({ color, onSelect, onClose }: { color: 'w' | 'b'; onSelect: (p: string) => void; onClose: () => void }) {
  const pieces = ['q', 'r', 'b', 'n'];
  const labels: Record<string, string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="modal" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 340, textAlign: 'center', padding: 28 }}
      >
        <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: '1.1rem' }}>Promote Pawn</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 20 }}>Choose your new piece</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {pieces.map(p => (
            <motion.button
              key={p}
              onClick={() => onSelect(p)}
              whileHover={{ scale: 1.08, borderColor: 'var(--neon-blue)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.05)',
                border: '2px solid var(--border-subtle)', cursor: 'pointer',
                transition: 'all 200ms', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                fontSize: '2.2rem', lineHeight: 1,
                filter: color === 'w' ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'brightness(0.15) drop-shadow(0 0 4px rgba(0,0,0,0.5))',
              }}>
                {PIECES[color + p]}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{labels[p]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChessBoard({
  fen,
  playerColor = 'w',
  onMove,
  flipped = false,
  disabled = false,
  lastMove,
  highlightSquares = [],
  showCoordinates = true,
  size,
  interactive = true,
}: ChessBoardProps) {
  const [chess] = useState(() => {
    if (fen && fen !== 'start') {
      try {
        return new Chess(fen);
      } catch {
        return new Chess();
      }
    }
    return new Chess();
  });
  const [currentFen, setCurrentFen] = useState(() => (fen && fen !== 'start' ? fen : chess.fen()));
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [internalLastMove, setInternalLastMove] = useState<{ from: string; to: string } | null>(lastMove || null);
  const [shake, setShake] = useState(false);
  const [dragPiece, setDragPiece] = useState<{ sq: string; x: number; y: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(size || 480);

  const boardTheme = useUIStore(s => s.boardTheme);
  const soundEnabled = useUIStore(s => s.soundEnabled);
  const theme = THEMES[boardTheme] || THEMES.cyber;

  // Sync FEN from outside
  useEffect(() => {
    if (fen && fen !== 'start' && fen !== chess.fen()) {
      try {
        chess.load(fen);
        setCurrentFen(fen);
        setSelected(null);
        setLegalMoves([]);
      } catch (err) {
        console.warn('Failed to load FEN in ChessBoard:', fen, err);
      }
    }
  }, [fen, chess]);

  useEffect(() => {
    if (lastMove) setInternalLastMove(lastMove);
  }, [lastMove]);

  // Responsive sizing
  useEffect(() => {
    if (size) return;
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setBoardSize(Math.min(w, 560));
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [size]);

  const squareSize = boardSize / 8;

  const squareName = (row: number, col: number): string => {
    const file = flipped ? 7 - col : col;
    const rank = flipped ? row : 7 - row;
    return `${'abcdefgh'[file]}${rank + 1}`;
  };

  // Get square name from pixel coordinates
  const getSquareFromCoords = useCallback((clientX: number, clientY: number): string | null => {
    if (!containerRef.current) return null;
    const boardEl = containerRef.current.querySelector('[data-board]') as HTMLElement;
    if (!boardEl) return null;
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
    const col = Math.floor(x / squareSize);
    const row = Math.floor(y / squareSize);
    return squareName(row, col);
  }, [squareSize, flipped]);

  const playSound = useCallback((type: 'move' | 'capture' | 'check' | 'castle' | 'promote') => {
    if (soundEnabled) playSynthSound(type);
  }, [soundEnabled]);

  const executeMove = useCallback((from: string, to: string, promotionPiece?: string) => {
    const result = chess.move({
      from: from as Square,
      to: to as Square,
      promotion: promotionPiece,
    });

    if (result) {
      setCurrentFen(chess.fen());
      setInternalLastMove({ from, to });
      setSelected(null);
      setLegalMoves([]);
      setPromotion(null);

      // Sound effects
      if (chess.inCheck()) {
        playSound('check');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else if (result.flags.includes('k') || result.flags.includes('q')) {
        playSound('castle');
      } else if (result.captured) {
        playSound('capture');
      } else if (result.flags.includes('p')) {
        playSound('promote');
      } else {
        playSound('move');
      }

      onMove?.(from, to, promotionPiece);
    }
  }, [chess, onMove, playSound]);

  const handleSquareClick = useCallback((sq: string) => {
    if (disabled || !interactive) return;
    if (chess.turn() !== playerColor) return;

    if (selected) {
      if (legalMoves.includes(sq)) {
        const moves = chess.moves({ square: selected as Square, verbose: true });
        const move = moves.find(m => m.to === sq);
        if (move?.flags.includes('p')) {
          setPromotion({ from: selected, to: sq });
          return;
        }
        executeMove(selected, sq);
        return;
      }
      setSelected(null);
      setLegalMoves([]);
      if (sq === selected) return;
    }

    const piece = chess.get(sq as Square);
    if (piece && piece.color === playerColor) {
      setSelected(sq);
      const moves = chess.moves({ square: sq as Square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }, [selected, legalMoves, disabled, interactive, playerColor, chess, executeMove]);

  // ── Drag & Drop ──
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, sq: string) => {
    if (disabled || !interactive) return;
    if (chess.turn() !== playerColor) return;
    const piece = chess.get(sq as Square);
    if (!piece || piece.color !== playerColor) return;

    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragPiece({ sq, x: clientX, y: clientY });
    setDragPos({ x: clientX, y: clientY });
    setSelected(sq);
    const moves = chess.moves({ square: sq as Square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
  }, [disabled, interactive, playerColor, chess]);

  useEffect(() => {
    if (!dragPiece) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragPos({ x: clientX, y: clientY });
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const targetSq = getSquareFromCoords(clientX, clientY);

      if (targetSq && targetSq !== dragPiece.sq && legalMoves.includes(targetSq)) {
        const moves = chess.moves({ square: dragPiece.sq as Square, verbose: true });
        const move = moves.find(m => m.to === targetSq);
        if (move?.flags.includes('p')) {
          setPromotion({ from: dragPiece.sq, to: targetSq });
        } else {
          executeMove(dragPiece.sq, targetSq);
        }
      } else {
        setSelected(null);
        setLegalMoves([]);
      }
      setDragPiece(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragPiece, legalMoves, chess, getSquareFromCoords, executeMove]);

  const handlePromotion = (piece: string) => {
    if (promotion) {
      executeMove(promotion.from, promotion.to, piece);
      playSound('promote');
    }
  };

  const board = chess.board();
  const kingInCheck = chess.inCheck() ? chess.turn() : null;

  // Find king square for check highlight
  let checkSquare: string | null = null;
  if (kingInCheck) {
    outer: for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'k' && p.color === kingInCheck) {
          checkSquare = `${'abcdefgh'[c]}${8 - r}`;
          break outer;
        }
      }
    }
  }

  const capturedWhite: string[] = [];
  const capturedBlack: string[] = [];
  chess.history({ verbose: true }).forEach(m => {
    if (m.captured) {
      if (m.color === 'w') capturedBlack.push(PIECES['b' + m.captured]);
      else capturedWhite.push(PIECES['w' + m.captured]);
    }
  });

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      {/* Captured pieces — opponent's pieces taken */}
      {capturedWhite.length > 0 && (
        <div style={{ display: 'flex', gap: 2, marginBottom: 8, flexWrap: 'wrap', minHeight: 24 }}>
          {capturedWhite.map((p, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              style={{ fontSize: '1.1rem' }}
            >{p}</motion.span>
          ))}
        </div>
      )}

      {/* Board */}
      <motion.div
        data-board
        animate={shake ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(8, ${squareSize}px)`,
          gridTemplateRows: `repeat(8, ${squareSize}px)`,
          border: `2px solid ${theme.border}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: theme.glow,
          width: squareSize * 8,
          height: squareSize * 8,
          cursor: dragPiece ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: 64 }, (_, idx) => {
          const row = Math.floor(idx / 8);
          const col = idx % 8;
          const sq = squareName(row, col);
          const boardRow = flipped ? 7 - row : row;
          const boardCol = flipped ? 7 - col : col;
          const piece = board[boardRow][boardCol];
          const isLight = (row + col) % 2 === 0;
          const isSelected = selected === sq;
          const isLastMove = internalLastMove && (internalLastMove.from === sq || internalLastMove.to === sq);
          const isLegalMove = legalMoves.includes(sq);
          const isCheck = sq === checkSquare;
          const isHighlighted = highlightSquares.includes(sq);
          const hasCapture = isLegalMove && piece;
          const isDragging = dragPiece?.sq === sq;

          let bg = isLight ? theme.light : theme.dark;
          if (isSelected) bg = theme.selected;
          else if (isCheck) bg = 'rgba(255,50,50,0.45)';
          else if (isLastMove) bg = theme.lastMove;
          else if (isHighlighted) bg = 'rgba(255,200,0,0.25)';

          return (
            <div
              key={sq}
              onClick={() => !dragPiece && handleSquareClick(sq)}
              onMouseDown={e => piece && piece.color === playerColor ? handleDragStart(e, sq) : undefined}
              onTouchStart={e => piece && piece.color === playerColor ? handleDragStart(e, sq) : undefined}
              style={{
                width: squareSize, height: squareSize,
                background: bg,
                position: 'relative',
                cursor: disabled || !interactive
                  ? 'default'
                  : (piece && piece.color === playerColor && chess.turn() === playerColor)
                    ? 'grab'
                    : isLegalMove ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
                userSelect: 'none',
              }}
            >
              {/* Coordinates */}
              {showCoordinates && col === 0 && (
                <span style={{
                  position: 'absolute', top: 2, left: 4,
                  fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
                  color: isLight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                  fontWeight: 700, pointerEvents: 'none', zIndex: 5,
                }}>
                  {flipped ? row + 1 : 8 - row}
                </span>
              )}
              {showCoordinates && row === 7 && (
                <span style={{
                  position: 'absolute', bottom: 2, right: 4,
                  fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
                  color: isLight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                  fontWeight: 700, pointerEvents: 'none', zIndex: 5,
                }}>
                  {'abcdefgh'[flipped ? 7 - col : col]}
                </span>
              )}

              {/* Legal move indicator — dot */}
              {isLegalMove && !hasCapture && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', width: '28%', height: '28%', borderRadius: '50%',
                    background: 'rgba(0,212,255,0.5)', boxShadow: '0 0 8px rgba(0,212,255,0.35)',
                    pointerEvents: 'none', zIndex: 4,
                  }}
                />
              )}
              {/* Legal move indicator — capture ring */}
              {isLegalMove && hasCapture && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 3,
                    border: '3px solid rgba(0,212,255,0.55)',
                    borderRadius: '50%', pointerEvents: 'none', zIndex: 4,
                    boxShadow: 'inset 0 0 10px rgba(0,212,255,0.15)',
                  }}
                />
              )}

              {/* Check glow */}
              {isCheck && (
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{
                    position: 'absolute', inset: -2,
                    background: 'radial-gradient(circle, rgba(255,50,50,0.5) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 1,
                  }}
                />
              )}

              {/* Piece */}
              {piece && !isDragging && (
                <motion.span
                  key={`${piece.color}${piece.type}-${sq}-${currentFen}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  style={{
                    fontSize: squareSize * 0.72,
                    lineHeight: 1,
                    zIndex: 3,
                    position: 'relative',
                    filter: piece.color === 'b'
                      ? 'brightness(0.1) drop-shadow(0 1px 3px rgba(0,0,0,0.8))'
                      : 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                    transition: 'filter 150ms',
                    pointerEvents: 'none',
                  }}
                >
                  {PIECES[piece.color + piece.type]}
                </motion.span>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Drag Ghost */}
      {dragPiece && (() => {
        const piece = chess.get(dragPiece.sq as Square) || ((): null => {
          // Piece was already on the square when drag started — get from board snapshot
          return null;
        })();
        const boardPiece = board[
          flipped
            ? 'abcdefgh'.indexOf(dragPiece.sq[0])
            : 7 - ('abcdefgh'.indexOf(dragPiece.sq[0]))
        ]?.[parseInt(dragPiece.sq[1]) - 1];
        const dp = piece || boardPiece;
        if (!dp) return null;
        return (
          <div
            style={{
              position: 'fixed',
              left: dragPos.x - squareSize * 0.4,
              top: dragPos.y - squareSize * 0.4,
              width: squareSize * 0.8,
              height: squareSize * 0.8,
              fontSize: squareSize * 0.72,
              lineHeight: `${squareSize * 0.8}px`,
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 1000,
              filter: dp.color === 'b'
                ? 'brightness(0.1) drop-shadow(0 4px 12px rgba(0,0,0,0.8))'
                : 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
              transform: 'scale(1.15)',
              transition: 'none',
            }}
          >
            {PIECES[dp.color + dp.type]}
          </div>
        );
      })()}

      {/* Captured pieces — player's pieces taken */}
      {capturedBlack.length > 0 && (
        <div style={{ display: 'flex', gap: 2, marginTop: 8, flexWrap: 'wrap', minHeight: 24 }}>
          {capturedBlack.map((p, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              style={{ fontSize: '1.1rem', filter: 'brightness(0.1)' }}
            >{p}</motion.span>
          ))}
        </div>
      )}

      {/* Game Over Banner */}
      <AnimatePresence>
        {chess.isGameOver() && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: 16, padding: '14px 24px',
              background: chess.isCheckmate()
                ? 'linear-gradient(135deg, rgba(255,50,50,0.12), rgba(155,89,255,0.12))'
                : 'rgba(255,200,0,0.08)',
              border: `1px solid ${chess.isCheckmate() ? 'rgba(255,50,50,0.3)' : 'rgba(255,200,0,0.3)'}`,
              borderRadius: 14, textAlign: 'center', fontSize: '1rem', fontWeight: 700,
              backdropFilter: 'blur(10px)',
            }}
          >
            {chess.isCheckmate() && `♟ Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`}
            {chess.isStalemate() && '½ Stalemate — Draw!'}
            {chess.isDraw() && !chess.isStalemate() && '½ Draw by repetition or 50-move rule!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotion dialog */}
      <AnimatePresence>
        {promotion && (
          <PromotionDialog
            color={playerColor}
            onSelect={handlePromotion}
            onClose={() => setPromotion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
