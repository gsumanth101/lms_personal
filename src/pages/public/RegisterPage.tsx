import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, TextField, Divider, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await registerWithEmail(email, password, name);
      if (result.error) {
        if (result.error.includes('configuration-not-found')) {
          setErrorMsg('Email/Password provider is not enabled in Firebase Console yet. Please enable Email/Password in Firebase Console > Authentication > Sign-in method.');
        } else {
          setErrorMsg(result.error);
        }
      } else if (result.user) {
        navigate('/dashboard');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        if (result.error.includes('configuration-not-found')) {
          setErrorMsg('Google Sign-in is not enabled in Firebase Console yet. Please enable Google in Firebase Console > Authentication > Sign-in method.');
        } else {
          setErrorMsg(result.error);
        }
      } else if (result.user) {
        navigate('/dashboard');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to sign up with Google');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-[#0b0f19] flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <NavLink to="/dashboard" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
              <GraduationCap className="w-7 h-7" />
            </div>
          </NavLink>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Join LearnOS to track courses, save notes, and earn certificates
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          {errorMsg && (
            <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Google Sign up Primary */}
          <button
            onClick={handleGoogleSignup}
            disabled={submitting}
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition flex items-center justify-center gap-3 font-semibold text-sm text-slate-800 dark:text-slate-100 shadow-xs"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>

          <Divider sx={{ my: 2 }}>
            <span className="text-xs text-slate-400 font-medium px-2">or register with email</span>
          </Divider>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sumanth Rao"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <User className="w-4 h-4 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <TextField
                fullWidth
                size="small"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="Must be at least 6 characters"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={submitting}
              endIcon={!submitting && <ArrowRight className="w-4 h-4" />}
              sx={{ py: 1.3, fontWeight: 700, borderRadius: 2.5, mt: 1 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <NavLink to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
};
