import { motion } from 'framer-motion';
import { mockUsers } from '../data/mockData';
import { useCurrentUser } from '../store';
import { Users, UserPlus, UserCheck, MessageSquare, Search, Swords } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { User } from '../types';

const onlineCount = mockUsers.filter(u => u.isOnline).length;

function FriendRow({ user, isFriend }: { user: User; isFriend: boolean }) {
  const [sent, setSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', marginBottom: 8, transition: 'all 200ms' }}
      whileHover={{ borderColor: 'rgba(0,212,255,0.15)', background: 'var(--bg-card-hover)' }}
    >
      <div style={{ position: 'relative' }}>
        <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: '1rem' }}>{user.username[0]}</div>
        {user.isOnline && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, background: '#00F550', border: '2px solid var(--bg-primary)' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
          {user.username}
          {user.title && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: '#FFC800', fontFamily: 'var(--font-mono)' }}>[{user.title}]</span>}
        </div>
        <div style={{ color: user.isOnline ? '#00F550' : 'var(--text-muted)', fontSize: '0.78rem' }}>
          {user.isOnline ? '● Online' : '○ Offline'} · ⚡ {user.rating}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {isFriend ? (
          <>
            <button className="btn-ghost btn-sm" style={{ padding: '7px 12px' }} onClick={() => toast('Chat feature coming soon!', { icon: '💬' })}>
              <MessageSquare size={14} />
            </button>
            <button className="btn-primary btn-sm" style={{ padding: '7px 12px' }} onClick={() => toast('Challenge sent!', { icon: '⚔️' })}>
              <Swords size={14} />
            </button>
          </>
        ) : (
          <button
            className={sent ? 'btn-ghost btn-sm' : 'btn-violet btn-sm'}
            onClick={() => { setSent(true); toast(`Friend request sent to ${user.username}!`, { icon: '👋' }); }}
            disabled={sent}
          >
            {sent ? <><UserCheck size={14} /> Sent</> : <><UserPlus size={14} /> Add</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function FriendsPage() {
  const activeUser = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'discover'>('friends');
  const otherUsers = mockUsers.filter(u => u.username.toLowerCase() !== activeUser.username.toLowerCase());
  const friends = otherUsers.slice(0, 3);
  const suggestions = otherUsers.slice(3);
  const filteredSuggestions = suggestions.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Users size={28} color="var(--neon-blue)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Friends</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          {friends.length} friends · {onlineCount} online now
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-card)', padding: 6, borderRadius: 14, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          {[{ key: 'friends', label: `My Friends (${friends.length})` }, { key: 'discover', label: 'Discover Players' }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as 'friends' | 'discover')}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: activeTab === t.key ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))' : 'transparent',
                color: activeTab === t.key ? 'white' : 'var(--text-secondary)',
                fontFamily: 'var(--font-primary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'friends' ? (
          <div>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14 }}>
              {onlineCount} Online
            </h2>
            {friends.filter(u => u.isOnline).map(u => <FriendRow key={u.id} user={u} isFriend />)}
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', margin: '20px 0 14px' }}>Offline</h2>
            {friends.filter(u => !u.isOnline).map(u => <FriendRow key={u.id} user={u} isFriend />)}
          </div>
        ) : (
          <div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                placeholder="Search players by username..."
                style={{ paddingLeft: 42 }}
              />
            </div>
            {filteredSuggestions.map(u => <FriendRow key={u.id} user={u} isFriend={false} />)}
            {filteredSuggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No players found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Pending Requests */}
        <div className="glass" style={{ padding: 20, marginTop: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>📥 Pending Friend Requests</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>G</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>GrandMaster99</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>⚡ 2201 · Wants to be your friend</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary btn-sm" onClick={() => toast('Friend request accepted!', { icon: '🤝' })}>Accept</button>
              <button className="btn-ghost btn-sm" style={{ color: '#FF5C5C', borderColor: 'rgba(255,92,92,0.3)' }} onClick={() => toast('Request declined')}>Decline</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
