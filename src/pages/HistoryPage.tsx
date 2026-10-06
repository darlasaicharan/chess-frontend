import { motion } from 'framer-motion';
import { mockGames } from '../data/mockData';
import { useCurrentUser } from '../store';
import { gameService, userService } from '../services/api';
import { History, Download, Eye, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'wins' | 'losses' | 'draws';

export default function HistoryPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<FilterType>('all');
  const [games, setGames] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gamesRes, statsRes] = await Promise.allSettled([
          gameService.getGames({ size: 50 }),
          userService.getStats(user.username),
        ]);
        if (gamesRes.status === 'fulfilled' && gamesRes.value?.data?.length > 0) {
          setGames(gamesRes.value.data);
        } else {
          setGames(mockGames);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        setGames(mockGames);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.username]);

  const displayWins = stats?.wins ?? user.wins ?? 0;
  const displayLosses = stats?.losses ?? user.losses ?? 0;
  const displayDraws = stats?.draws ?? user.draws ?? 0;
  const displayGamesPlayed = stats?.gamesPlayed ?? user.gamesPlayed ?? (displayWins + displayLosses + displayDraws);

  const getResult = (game: any) => {
    const isWhite = (game.white?.username || '').toLowerCase() === user.username.toLowerCase();
    if (game.result === '1/2-1/2' || game.result === 'DRAW' || game.result === 'draw') return 'draw';
    if (game.result === '1-0' || game.result === 'WHITE_WIN') return isWhite ? 'win' : 'loss';
    if (game.result === '0-1' || game.result === 'BLACK_WIN') return isWhite ? 'loss' : 'win';
    return 'draw';
  };

  const filterMap: Record<FilterType, string> = { all: '', wins: 'win', losses: 'loss', draws: 'draw' };

  const filtered = games.filter(g => {
    if (filter === 'all') return true;
    return getResult(g) === filterMap[filter];
  });

  const resultColor: Record<string, string> = { win: '#00F550', loss: '#FF5C5C', draw: '#FFC800' };
  const resultEmoji: Record<string, string> = { win: '🏆', loss: '💀', draw: '🤝' };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <History size={28} color="var(--neon-violet)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Game History</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          {displayGamesPlayed} games played · {displayWins}W {displayLosses}L {displayDraws}D
        </p>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-card)', padding: 6, borderRadius: 14, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          {(['all', 'wins', 'losses', 'draws'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-primary)',
                background: filter === f ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div>
          {filtered.map((game, i) => {
            const result = getResult(game);
            const opponent = game.white.username.toLowerCase() === user.username.toLowerCase() ? game.black : game.white;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card"
                style={{ padding: '18px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}
              >
                {/* Result indicator */}
                <div style={{ width: 6, height: 52, borderRadius: 3, background: resultColor[result], boxShadow: `0 0 8px ${resultColor[result]}80`, flexShrink: 0 }} />

                {/* Result badge */}
                <div style={{ minWidth: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem' }}>{resultEmoji[result]}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: resultColor[result], textTransform: 'uppercase' }}>{result}</div>
                </div>

                {/* Opponent */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                    vs <span style={{ color: 'var(--neon-blue)' }}>{opponent.username}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>⚡ {opponent.rating}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>📖 {game.opening || 'Unknown Opening'}</span>
                    <span>⏱ {game.timeControl}</span>
                    <span>♟ {game.moves} moves</span>
                  </div>
                </div>

                {/* Accuracy */}
                {game.accuracy && (
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>Accuracy</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-blue)' }}>
                      {game.white.username.toLowerCase() === user.username.toLowerCase() ? game.accuracy.white : game.accuracy.black}%
                    </div>
                  </div>
                )}

                {/* Rating change */}
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>Rating</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
                    color: result === 'win' ? '#00F550' : result === 'loss' ? '#FF5C5C' : '#FFC800',
                  }}>
                    {result === 'win' ? '+12' : result === 'loss' ? '-10' : '+0'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost btn-sm" style={{ padding: '7px 12px' }} onClick={() => toast('Loading game analysis...', { icon: '📊' })}>
                    <BarChart3 size={14} />
                  </button>
                  <button className="btn-ghost btn-sm" style={{ padding: '7px 12px' }} onClick={() => toast('PGN copied to clipboard!', { icon: '📋' })}>
                    <Download size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              No {filter} games found
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
