// ==================== src/utils/validationHelpers.js ====================
/**
 * Email validation
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++; // 8+ characters
  if (/[A-Z]/.test(password)) strength++; // Has uppercase
  if (/[a-z]/.test(password)) strength++; // Has lowercase
  if (/[0-9]/.test(password)) strength++; // Has number
  if (/[!@#$%^&*]/.test(password)) strength++; // Has special char
  
  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return {
    score: strength,
    level: levels[strength] || 'Very Weak',
    percentage: (strength / 5) * 100
  };
};

/**
 * Validate password complexity
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// ==================== src/utils/tokenHelpers.js ====================
const jwt = require("jsonwebtoken");

/**
 * Generate JWT token
 */
const generateToken = (userId, expiresIn = "30d") => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate reset token (short-lived)
 */
const generateResetToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET + "RESET",
    { expiresIn: "1h" }
  );
};

/**
 * Verify reset token
 */
const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET + "RESET");
  } catch (error) {
    return null;
  }
};

// ==================== src/middleware/rateLimitMiddleware.js ====================
const rateLimit = require("express-rate-limit");

/**
 * Rate limit for password reset attempts
 * Max 3 attempts per 15 minutes per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: "Too many password reset attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Skip for development
  skip: () => process.env.NODE_ENV === "development"
});

/**
 * Rate limit for login attempts
 * Max 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limit for signup
 * Max 5 signups per hour per IP
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many accounts created from this IP, please try again later.",
});

module.exports = {
  passwordResetLimiter,
  loginLimiter,
  signupLimiter
};

// ==================== src/utils/emailHelpers.js ====================
/**
 * Extract domain from email
 */
const getEmailDomain = (email) => {
  return email.split('@')[1];
};

/**
 * Mask email for privacy
 */
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  const maskChar = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
  return `${maskChar}@${domain}`;
};

/**
 * Check if email is valid format
 */
const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email input
 */
const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

// ==================== src/utils/timeHelpers.js ====================
/**
 * Get time remaining until expiry
 */
const getTimeRemaining = (expiryTime) => {
  const now = new Date();
  const remaining = expiryTime - now;
  
  if (remaining <= 0) {
    return { expired: true, timeRemaining: 0 };
  }
  
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  return {
    expired: false,
    timeRemaining: remaining,
    minutes,
    seconds,
    formatted: `${minutes}m ${seconds}s`
  };
};

/**
 * Format time until expiry as readable string
 */
const formatExpiryTime = (expiryTime) => {
  const { expired, formatted } = getTimeRemaining(expiryTime);
  
  if (expired) {
    return "Expired";
  }
  
  return formatted;
};

// ==================== src/utils/responseHelpers.js ====================
/**
 * Success response formatter
 */
const successResponse = (message, data = null, meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta
  };
};

/**
 * Error response formatter
 */
const errorResponse = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(errors && { errors })
  };
};

// ==================== Frontend Helper Hooks ====================
// Add to your frontend/src/hooks/usePasswordRecovery.js

import { useState } from 'react';
import axios from 'axios';

export const usePasswordRecovery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState('email'); // email, code, reset

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );
      
      if (response.data.success) {
        setSuccess('Recovery email sent successfully');
        setCurrentStep('code');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send recovery email';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const verifyRecoveryCode = async (email, code) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-reset-token`,
        { email, code }
      );
      
      if (response.data.success) {
        setSuccess('Code verified');
        setCurrentStep('reset');
        return { 
          success: true, 
          resetToken: response.data.resetToken,
          userId: response.data.userId
        };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid code';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        { email, resetToken, newPassword }
      );
      
      if (response.data.success) {
        setSuccess('Password reset successfully!');
        setCurrentStep('email');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError('');
    setSuccess('');
    setCurrentStep('email');
  };

  return {
    loading,
    error,
    success,
    currentStep,
    requestPasswordReset,
    verifyRecoveryCode,
    resetPassword,
    resetState
  };
};

// ==================== Example Usage in Component ====================
// import { usePasswordRecovery } from '../hooks/usePasswordRecovery';
//
// function MyComponent() {
//   const { loading, error, success, requestPasswordReset } = usePasswordRecovery();
//
//   const handleForgotPassword = async (email) => {
//     const result = await requestPasswordReset(email);
//     if (result.success) {
//       // Move to next step
//     }
//   };
//
//   return (
//     <div>
//       {error && <ErrorMessage>{error}</ErrorMessage>}
//       {success && <SuccessMessage>{success}</SuccessMessage>}
//       {/* Form JSX */}
//     </div>
//   );
// }

module.exports = {
  // Validation
  isValidEmail,
  getPasswordStrength,
  isValidPassword,
  
  // Tokens
  generateToken,
  verifyToken,
  generateResetToken,
  verifyResetToken,
  
  // Email
  getEmailDomain,
  maskEmail,
  isValidEmailFormat,
  sanitizeEmail,
  
  // Time
  getTimeRemaining,
  formatExpiryTime,
  
  // Response
  successResponse,
  errorResponse
};
