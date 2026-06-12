const express = require("express");
const router = express.Router();

const { 
  signup, 
  login, 
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

/**
 * Public routes
 */

// Register new user
router.post("/signup", signup);

// Login user
router.post("/login", login);

/**
 * Password Recovery Routes
 */

// Step 1: Request password reset (send email with code)
router.post("/forgot-password", forgotPassword);

// Step 2: Verify recovery code from email
router.post("/verify-reset-token", verifyResetToken);

// Step 3: Reset password with valid token
router.post("/reset-password", resetPassword);

/**
 * Protected routes (require authentication)
 */

// Change password for logged-in users
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
