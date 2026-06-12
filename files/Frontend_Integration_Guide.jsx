// ==================== AuthPage.jsx (Updated) ====================
// This shows how to integrate the password recovery flow into your existing auth page

import React, { useState } from 'react';
import axios from 'axios';
import { ForgotPasswordModal, VerifyCodeModal, ResetPasswordModal } from './components/PasswordRecoveryComponents';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Password recovery state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Login/Signup state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ============= Password Recovery Handlers =============
  
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setError('');
  };

  const handleForgotPasswordSuccess = (email) => {
    setRecoveryEmail(email);
    setShowForgotPassword(false);
    setShowVerifyCode(true);
  };

  const handleVerifyCodeSuccess = (token) => {
    setResetToken(token);
    setShowVerifyCode(false);
    setShowResetPassword(true);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setRecoveryEmail('');
    setResetToken('');
    setSuccessMessage('Password reset successful! Please login with your new password.');
    setIsLogin(true);
    
    // Clear message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ============= Login/Signup Handlers =============

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        isLogin
          ? { email: formData.email, password: formData.password }
          : formData
      );

      if (response.data.success || response.data.token) {
        if (isLogin) {
          // Save token and redirect
          localStorage.setItem('token', response.data.token);
          setSuccessMessage('Login successful! Redirecting...');
          // Redirect after delay
          setTimeout(() => window.location.href = '/home', 1500);
        } else {
          // Signup successful
          setSuccessMessage('Account created! Check your email for a welcome message. Redirecting to login...');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ name: '', email: '', password: '' });
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎬 MovieReview</h1>
          <p className="text-blue-100">
            {isLogin ? 'Login to your account' : 'Create your account'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '' });
                  setError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Password Recovery Modals */}
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />

        <VerifyCodeModal
          isOpen={showVerifyCode}
          onClose={() => setShowVerifyCode(false)}
          email={recoveryEmail}
          onSuccess={handleVerifyCodeSuccess}
        />

        <ResetPasswordModal
          isOpen={showResetPassword}
          onClose={() => setShowResetPassword(false)}
          email={recoveryEmail}
          resetToken={resetToken}
          onSuccess={handleResetPasswordSuccess}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>By using MovieReview, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

// ==================== ENV Configuration ====================
/*
Add to your .env file:

VITE_API_URL=http://localhost:5000

For production:
VITE_API_URL=https://api.yourdomain.com
*/

// ==================== Usage in main App.jsx ====================
/*
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      {/* other routes */}
    </Routes>
  );
}
*/
