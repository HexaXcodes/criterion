const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { autoPopulateWatchlist } = require("./aiController");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require("../utils/emailService");

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a secure reset token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * SIGNUP - Register a new user
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Please provide name, email, and password",
        success: false 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters",
        success: false 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: "User already exists with this email",
        success: false 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
      // Don't fail signup if email fails
    }

    res.status(201).json({
      message: "User registered successfully! Check your email for a welcome message.",
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

/**
 * LOGIN - Authenticate user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password required",
        success: false 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid credentials",
        success: false 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Invalid credentials",
        success: false 
      });
    }

    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.streak.lastLogin
      ? new Date(user.streak.lastLogin)
      : null;

    let streakMessage = "";
    let pointsEarned = 0;

    if (!lastLogin) {
      user.streak.count = 1;
      user.streak.lastLogin = today;
      pointsEarned = 10;
      streakMessage = "Welcome! Streak started!";
    } else {
      const lastLoginDay = new Date(lastLogin);
      lastLoginDay.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today - lastLoginDay) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        streakMessage = `Current streak: ${user.streak.count} days`;
        pointsEarned = 0;
      } else if (diffDays === 1) {
        user.streak.count += 1;
        user.streak.lastLogin = today;
        pointsEarned = 10 * user.streak.count;
        streakMessage = `🔥 ${user.streak.count} day streak! +${pointsEarned} points`;
      } else {
        user.streak.count = 1;
        user.streak.lastLogin = today;
        pointsEarned = 10;
        streakMessage = `Streak reset. New streak started! +10 points`;
      }
    }

    user.points += pointsEarned;
    await user.save();

    // Auto populate watchlist in background
    const addedMovies = await autoPopulateWatchlist(user._id);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      success: true,
      token,
      streakMessage,
      streak: user.streak.count,
      points: user.points,
      addedToWatchlist: addedMovies || [],
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        points: user.points,
        preferences: user.preferences
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

/**
 * FORGOT PASSWORD - Send recovery code to email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        success: false 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: "If an account exists with this email, a recovery code will be sent.",
        success: true 
      });
    }

    // Generate 6-digit code
    const code = generateVerificationCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Set expiry to 15 minutes
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    user.resetToken = hashedCode;
    user.resetTokenExpiry = expiryTime;
    user.plainResetCode = code; // Temporary - remove after sending email
    
    await user.save();

    // Send email with recovery code
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?code=${code}`;
    
    try {
      await sendPasswordResetEmail(email, user.name, code, resetLink);
    } catch (emailError) {
      // Remove the reset token if email fails
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      
      return res.status(500).json({ 
        message: "Failed to send email. Please try again.",
        success: false 
      });
    }

    res.json({ 
      message: "Recovery code sent to your email",
      success: true,
      // For development only - REMOVE IN PRODUCTION
      ...(process.env.NODE_ENV === "development" && { code })
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

/**
 * VERIFY RESET TOKEN - Verify the recovery code from email
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        message: "Email and code are required",
        success: false 
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetToken) {
      return res.status(400).json({ 
        message: "Invalid or expired reset code",
        success: false 
      });
    }

    // Check if token has expired
    if (new Date() > user.resetTokenExpiry) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

      return res.status(400).json({ 
        message: "Recovery code has expired. Please request a new one.",
        success: false 
      });
    }

    // Verify the code
    const isCodeValid = await bcrypt.compare(code, user.resetToken);
    
    if (!isCodeValid) {
      return res.status(400).json({ 
        message: "Invalid recovery code",
        success: false 
      });
    }

    // Generate a JWT token for password reset
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET + "RESET",
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Code verified successfully",
      success: true,
      resetToken,
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

/**
 * RESET PASSWORD - Set new password with valid token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ 
        message: "Email, token, and new password are required",
        success: false 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters",
        success: false 
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET + "RESET");
    } catch (error) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token",
        success: false 
      });
    }

    const user = await User.findOne({ email });

    if (!user || user._id.toString() !== decoded.id) {
      return res.status(400).json({ 
        message: "Invalid reset request",
        success: false 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset tokens
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.plainResetCode = undefined; // Remove temporary field

    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(email, user.name);
    } catch (emailError) {
      console.error("Password changed email failed:", emailError);
      // Don't fail the reset if confirmation email fails
    }

    res.json({ 
      message: "Password reset successfully! You can now login with your new password.",
      success: true 
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

/**
 * CHANGE PASSWORD - For logged-in users
 */
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current and new passwords are required",
        success: false 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters",
        success: false 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        success: false 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: "Current password is incorrect",
        success: false 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Password changed email failed:", emailError);
    }

    res.json({ 
      message: "Password changed successfully!",
      success: true 
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};
