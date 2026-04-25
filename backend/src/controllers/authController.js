const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
      // First login ever
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
        // Already logged in today
        streakMessage = `Current streak: ${user.streak.count} days`;
        pointsEarned = 0;
      } else if (diffDays === 1) {
        // Logged in yesterday — continue streak
        user.streak.count += 1;
        user.streak.lastLogin = today;
        pointsEarned = 10 * user.streak.count;
        streakMessage = `🔥 ${user.streak.count} day streak! +${pointsEarned} points`;
      } else {
        // Missed a day — reset streak
        user.streak.count = 1;
        user.streak.lastLogin = today;
        pointsEarned = 10;
        streakMessage = `Streak reset. New streak started! +10 points`;
      }
    }

    user.points += pointsEarned;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      streakMessage,
      streak: user.streak.count,
      points: user.points,
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
    res.status(500).json({ message: error.message });
  }
};