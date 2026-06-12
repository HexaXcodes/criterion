import React, { useState } from 'react';
import api from '../api/client';

/**
 * FORGOT PASSWORD MODAL
 */
const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setMessage('Recovery code sent to your email! Check your inbox.');
        // In development mode, append the code to the message for easy testing
        if (response.data.code) {
          setMessage(`[DEV ONLY] Code: ${response.data.code} (sent to email)`);
        }
        
        setTimeout(() => {
          onSuccess(email);
          setEmail('');
          setMessage('');
        }, 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-modal p-4 animate-fade-in">
      <div 
        className="glass-strong rounded-3xl p-8 border border-white/10 w-full max-w-md relative animate-slide-up shadow-2xl bg-[#0d0d0d]/95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-pink-neon text-2xl transition cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="display-glow text-2xl mb-2 font-display">Forgot Password?</h2>
        <p className="text-text-secondary text-sm mb-6">
          Enter your email address and we'll send you a 6-digit recovery code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-glass"
            />
          </div>

          {message && (
            <div className="p-4 bg-teal-neon/10 border border-teal-neon/30 rounded-xl text-teal-soft text-sm">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-pink-neon/10 border border-pink-neon/30 rounded-xl text-pink-soft text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Recovery Code'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-6 text-sm text-text-muted hover:text-text-primary transition font-medium cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

/**
 * VERIFY CODE MODAL
 */
const VerifyCodeModal = ({ isOpen, onClose, email, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-reset-token', { email, code });

      if (response.data.success) {
        onSuccess(response.data.resetToken);
        setCode('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-modal p-4 animate-fade-in">
      <div 
        className="glass-strong rounded-3xl p-8 border border-white/10 w-full max-w-md relative animate-slide-up shadow-2xl bg-[#0d0d0d]/95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-pink-neon text-2xl transition cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="display-glow text-2xl mb-2 font-display">Verify Code</h2>
        <p className="text-text-secondary text-sm mb-6">
          Enter the 6-digit verification code sent to <strong className="text-pink-soft">{email}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-3 uppercase self-start">
              Recovery Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              required
              className="input-glass font-mono text-center text-3xl tracking-widest py-3 mb-2 max-w-[200px]"
            />
            <p className="text-xs text-text-muted self-start">Code is valid for 15 minutes</p>
          </div>

          {error && (
            <div className="p-4 bg-pink-neon/10 border border-pink-neon/30 rounded-xl text-pink-soft text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="btn-primary w-full text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full mt-6 text-sm text-text-muted hover:text-text-primary transition font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * RESET PASSWORD MODAL
 */
const ResetPasswordModal = ({ isOpen, onClose, email, resetToken, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { email, resetToken, newPassword });

      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          onSuccess();
          setNewPassword('');
          setConfirmPassword('');
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-modal p-4 animate-fade-in">
      <div 
        className="glass-strong rounded-3xl p-8 border border-white/10 w-full max-w-md relative animate-slide-up shadow-2xl bg-[#0d0d0d]/95"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="display-glow text-2xl mb-2 font-display">New Password</h2>
        <p className="text-text-secondary text-sm mb-6">
          Set a secure new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-glass"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-widest mb-2 uppercase">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-glass"
            />
          </div>

          {message && (
            <div className="p-4 bg-teal-neon/10 border border-teal-neon/30 rounded-xl text-teal-soft text-sm">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-pink-neon/10 border border-pink-neon/30 rounded-xl text-pink-soft text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export { ForgotPasswordModal, VerifyCodeModal, ResetPasswordModal };
