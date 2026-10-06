import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { useAuthStore } from '../store';
import { currentUser } from '../data/mockData';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(v => v, 'You must agree to the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const perks = [
  'Free forever — no credit card required',
  'Play unlimited games vs AI',
  'Access all puzzles and training tools',
  'Compete in weekly tournaments',
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreeTerms: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const res = await authService.register(data.username, data.email, data.password);
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token, res.data.refreshToken || res.data.token);
        toast.success('Account created! Welcome to NEONMATE CHESS 🎉');
        navigate('/dashboard');
        setLoading(false);
        return;
      }
    } catch {
      // Backend not running or offline, fallback to demo user
    }

    await new Promise(r => setTimeout(r, 600));
    login(
      { ...currentUser, username: data.username, email: data.email },
      'mock-jwt-token-' + Date.now(),
      'mock-refresh-token'
    );
    toast.success('Account created! Welcome to NEONMATE CHESS 🎉');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '30%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,89,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Left: Perks */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00D4FF, #9B59FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 0 25px rgba(0,212,255,0.3)' }}>♟</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>NEONMATE CHESS</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>by Darla Sai Charan</div>
            </div>
          </Link>

          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
              Join the <span className="gradient-text">Chess Revolution</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Create your account and start your journey to chess mastery. AI-powered analysis, world-class competition, and a thriving community await.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="white" />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{perk}</span>
              </motion.div>
            ))}
          </div>

          {/* Rating preview */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>🏆 Top Players This Week</div>
            {[
              { name: 'NeonKing', rating: 2847, flag: '🇮🇳' },
              { name: 'CyberQueen', rating: 2654, flag: '🇺🇸' },
              { name: 'VoidBishop', rating: 2401, flag: '🇷🇺' },
            ].map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: i === 0 ? '#FFC800' : i === 1 ? '#C0C0C0' : '#CD7F32', fontWeight: 800, fontSize: '0.8rem', minWidth: 20 }}>#{i + 1}</span>
                <span style={{ fontSize: '0.9rem' }}>{p.flag}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{p.name}</span>
                <span style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.rating}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="glass" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, var(--neon-violet), transparent)' }} />

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 28 }}>Free forever. No credit card needed.</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Username</label>
                <input {...register('username')} className="input-field" placeholder="YourChessName" />
                {errors.username && <p style={{ color: '#FF5C5C', fontSize: '0.78rem', marginTop: 4 }}>{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                {errors.email && <p style={{ color: '#FF5C5C', fontSize: '0.78rem', marginTop: 4 }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field" placeholder="Min 8 characters" style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#FF5C5C', fontSize: '0.78rem', marginTop: 4 }}>{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input {...register('confirmPassword')} type="password" className="input-field" placeholder="••••••••" />
                {errors.confirmPassword && <p style={{ color: '#FF5C5C', fontSize: '0.78rem', marginTop: 4 }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <input {...register('agreeTerms')} type="checkbox" id="terms" style={{ marginTop: 2, accentColor: 'var(--neon-blue)', width: 16, height: 16 }} />
                <label htmlFor="terms" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.5 }}>
                  I agree to the <a href="#" style={{ color: 'var(--neon-blue)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--neon-blue)' }}>Privacy Policy</a>
                </label>
              </div>
              {errors.agreeTerms && <p style={{ color: '#FF5C5C', fontSize: '0.78rem' }}>{errors.agreeTerms.message}</p>}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }} disabled={loading}>
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</>
                ) : (
                  <><UserPlus size={18} /> Create Account</>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--neon-blue)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
