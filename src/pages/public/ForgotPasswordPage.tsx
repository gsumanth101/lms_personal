import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Send, Mail, CheckCircle2 } from 'lucide-react';
import { Button, TextField, Alert, InputAdornment, CircularProgress } from '@mui/material';
import { resetPassword } from '../../services/firebase/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSent(true);
      } else {
        setErrorMsg(res.error || 'Failed to send reset link');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error occurred while sending reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-[#0b0f19] flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <NavLink to="/login" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
              <GraduationCap className="w-7 h-7" />
            </div>
          </NavLink>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your account email to receive a password recovery link
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We've sent a password reset link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>. Follow the instructions to reset your password.
                </p>
              </div>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSent(false)}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Send to another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Email Address
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={submitting}
                startIcon={!submitting && <Send className="w-4 h-4" />}
                sx={{ py: 1.3, fontWeight: 700, borderRadius: 2.5 }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Send Password Reset Link'}
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

