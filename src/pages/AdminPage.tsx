import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Users, Activity, Radio, Cpu,
  Database, Ban, Award, Send,
  RefreshCw, Search, Terminal
} from 'lucide-react';
import { mockUsers } from '../data/mockData';
import toast from 'react-hot-toast';
import type { User } from '../types';

export default function AdminPage() {
  const [usersList, setUsersList] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [engineClusterLoad, setEngineClusterLoad] = useState(28);

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = (id: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const isBanned = (u as any).isBanned;
        toast.success(isBanned ? `Unbanned ${u.username}` : `Banned ${u.username} for Fair Play inspection`);
        return { ...u, isBanned: !isBanned };
      }
      return u;
    }));
  };

  const grantTitle = (id: string) => {
    const title = prompt('Enter title to grant (e.g. GM, IM, FM, CM):', 'GM');
    if (!title) return;
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, title: title.toUpperCase() } : u));
    toast.success(`Title ${title.toUpperCase()} granted!`);
  };

  const sendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    toast.success(`Platform announcement broadcasted to 3,842 active players!`, { icon: '📢' });
    setBroadcastText('');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1250, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <ShieldAlert size={28} color="#FF5C5C" style={{ filter: 'drop-shadow(0 0 10px rgba(255,92,92,0.5))' }} />
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Admin Mission Control</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Live platform arbitration, Stockfish server telemetry, and player governance.</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setEngineClusterLoad(Math.floor(20 + Math.random() * 25));
                toast.success('Telemetry refreshed!');
              }}
              className="btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Refresh Telemetry
            </button>
            <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={12} className="pulse-slow" /> MASTER PRIVILEGES
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cluster Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'ACTIVE WEBSOCKETS', val: '3,842', sub: '+12% from peak', icon: <Radio size={18} color="var(--neon-blue)" />, border: 'var(--neon-blue)' },
          { label: 'ENGINE CLUSTER LOAD', val: `${engineClusterLoad}%`, sub: '12 / 16 Nodes Active', icon: <Cpu size={18} color="#00F5A0" />, border: '#00F5A0' },
          { label: 'FAIR-PLAY SCANS / MIN', val: '1,420', sub: '0 Cheaters Detected', icon: <Activity size={18} color="#FFC800" />, border: '#FFC800' },
          { label: 'DATABASE REPLICATION', val: '11ms', sub: 'MySQL + Redis Cache OK', icon: <Database size={18} color="#9B59FF" />, border: '#9B59FF' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            className="glass-card"
            style={{ padding: 20, borderTop: `3px solid ${c.border}` }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{c.label}</span>
              {c.icon}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{c.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* User Governance Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--neon-blue)" /> Player Directory & Moderation
            </h2>

            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '7px 10px 7px 30px',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Player</th>
                  <th style={{ padding: '8px 10px' }}>Rating</th>
                  <th style={{ padding: '8px 10px' }}>Title</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isBanned = (u as any).isBanned;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 700 }}>{u.username}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{u.rating}</td>
                      <td style={{ padding: '10px' }}>
                        {u.title ? <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{u.title}</span> : '-'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {isBanned ? (
                          <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>BANNED</span>
                        ) : (
                          <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>ACTIVE</span>
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => grantTitle(u.id)}
                            className="btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            title="Grant Title"
                          >
                            <Award size={13} /> Title
                          </button>
                          <button
                            onClick={() => toggleBan(u.id)}
                            className={`btn-sm ${isBanned ? 'btn-secondary' : 'btn-ghost'}`}
                            style={{ padding: '4px 8px', fontSize: '0.72rem', color: isBanned ? '#fff' : '#FF5C5C', borderColor: 'rgba(255,92,92,0.3)' }}
                          >
                            <Ban size={13} /> {isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Broadcast Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={16} color="var(--neon-purple)" /> Platform Announcement Broadcast
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Transmit a high-priority toast modal to all online players in real time.
            </p>
            <form onSubmit={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                rows={3}
                placeholder="e.g. Scheduled maintenance in 15 minutes, ongoing games are safeguarded..."
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: 10,
                  color: '#fff',
                  fontSize: '0.82rem',
                  resize: 'none'
                }}
              />
              <button type="submit" className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 }}>
                <Send size={14} /> Send Global Notification
              </button>
            </form>
          </div>

          {/* Engine Nodes Live Monitor */}
          <div className="glass-card" style={{ padding: 22, flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={16} color="var(--neon-blue)" /> Stockfish Pod Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'pod-stockfish-alpha-01', load: '14%', status: 'ONLINE', ping: '2ms' },
                { name: 'pod-stockfish-alpha-02', load: '32%', status: 'ONLINE', ping: '3ms' },
                { name: 'pod-stockfish-alpha-03', load: '41%', status: 'BUSY', ping: '5ms' },
                { name: 'pod-stockfish-alpha-04', load: '22%', status: 'ONLINE', ping: '2ms' },
              ].map(pod => (
                <div key={pod.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)' }}>{pod.name}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span>{pod.load}</span>
                    <span style={{ color: pod.status === 'ONLINE' ? '#00F5A0' : '#FFC800' }}>● {pod.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
