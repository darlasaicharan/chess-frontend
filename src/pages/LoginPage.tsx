import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../store';
import { currentUser, mockUsers } from '../data/mockData';
import { authService } from '../services/api';
import type { User } from '../types';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleLoginAsUser = (targetUser: User) => {
    login(targetUser, 'mock-jwt-token-' + Date.now(), 'mock-refresh-token');
    toast.success(`Welcome back, ${targetUser.username}! 🏆`);
    navigate('/dashboard');
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const res = await authService.login(data.email, data.password);
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token, res.data.refreshToken || res.data.token);
        toast.success(`Welcome back, ${res.data.user.username}! 🏆`);
        navigate('/dashboard');
        setLoading(false);
        return;
      }
    } catch {
      // Backend not running or offline, proceed with local demo user
    }

    await new Promise(r => setTimeout(r, 400));

    const query = data.email.toLowerCase().trim();
    const matchedUser = mockUsers.find(
      u => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );

    let associatedUser: User;
    if (matchedUser) {
      associatedUser = { ...matchedUser };
    } else {
      // Derive clean username from input
      const prefix = query.includes('@') ? query.split('@')[0] : query;
      const cleanName = prefix
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

      associatedUser = {
        id: 'usr_' + Date.now(),
        email: query.includes('@') ? data.email : `${query}@neonmate.chess`,
        username: cleanName || 'Player',
        rating: 1500,
        gamesPlayed: 12,
        wins: 7,
        losses: 4,
        draws: 1,
        role: 'USER',
        createdAt: new Date().toISOString(),
        country: 'IN',
        isOnline: true,
      };
    }

    login(
      associatedUser,
      'mock-jwt-token-' + Date.now(),
      'mock-refresh-token'
    );
    toast.success(`Welcome back, ${associatedUser.username}! 🏆`);
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,89,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #00D4FF, #9B59FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', boxShadow: '0 0 30px rgba(0,212,255,0.3)',
            }}>♟</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em' }}>NEONMATE</div>
              <div style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em' }}>CHESS</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
          {/* Top gradient line */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(90deg, transparent, var(--neon-blue), transparent)',
          }} />

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.9rem' }}>
            Sign in to continue your chess journey
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p style={{ color: '#FF5C5C', fontSize: '0.8rem', marginTop: 6 }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#FF5C5C', fontSize: '0.8rem', marginTop: 6 }}>{errors.password.message}</p>
              )}
            </div>

            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <a href="#" style={{ color: 'var(--neon-blue)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</>
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--neon-blue)', fontWeight: 600, textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>

          {/* Quick Demo Login Accounts */}
          <div style={{
            marginTop: 24, padding: '16px',
            background: 'rgba(0,212,255,0.04)', borderRadius: 12,
            border: '1px solid rgba(0,212,255,0.15)',
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, textAlign: 'center' }}>
              ⚡ Quick Login as Demo Player:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[currentUser, ...mockUsers.slice(0, 3)].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleLoginAsUser(u)}
                  className="btn-ghost btn-sm"
                  style={{
                    fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start',
                    borderColor: 'rgba(0,212,255,0.2)', background: 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#fff' }}>{u.username}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', marginLeft: 'auto' }}>{u.rating}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
