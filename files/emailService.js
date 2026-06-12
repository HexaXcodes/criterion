const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    console.log("Email service error:", error);
  } else {
    console.log("✅ Email service is ready");
  }
});

/**
 * Send welcome email to new users
 * @param {string} email - User's email
 * @param {string} name - User's name
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎬 Welcome to MovieReview!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .features { list-style: none; padding: 0; }
              .features li { padding: 8px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎬 Welcome to MovieReview!</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${name}</strong>,</p>
                
                <p>Welcome to our movie review community! We're thrilled to have you join us. 🍿</p>
                
                <h3>Get Started:</h3>
                <ul class="features">
                  <li>✨ Discover movies curated for your taste</li>
                  <li>⭐ Write and share your movie reviews</li>
                  <li>💬 Join communities and discuss films</li>
                  <li>🎯 Build your personalized watchlist</li>
                  <li>🔥 Earn points and build streaks</li>
                </ul>
                
                <a href="${process.env.FRONTEND_URL}/login" class="cta-button">
                  Start Exploring Movies →
                </a>
                
                <p>Happy reviewing!</p>
                <p><strong>The MovieReview Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

/**
 * Send password reset email with recovery code
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} code - 6-digit recovery code
 * @param {string} resetLink - Full reset link (optional)
 */
exports.sendPasswordResetEmail = async (email, name, code, resetLink) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Password Recovery - MovieReview",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .code-box { background: white; border: 2px solid #f5576c; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px; }
              .cta-button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Recovery</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${name}</strong>,</p>
                
                <p>We received a request to reset your MovieReview password. If you didn't request this, you can safely ignore this email.</p>
                
                <h3>Your Recovery Code:</h3>
                <div class="code-box">
                  <div class="code">${code}</div>
                  <p style="color: #666; margin: 10px 0 0 0;">Valid for 15 minutes</p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Note:</strong> Never share this code with anyone. We will never ask for it via email or chat.
                </div>
                
                ${resetLink ? `<p style="text-align: center;">
                  <a href="${resetLink}" class="cta-button">
                    Reset Password →
                  </a>
                </p>` : ''}
                
                <h3>Steps to Reset:</h3>
                <ol>
                  <li>Copy the 6-digit code above</li>
                  <li>Go to the password reset page</li>
                  <li>Paste the code and enter your new password</li>
                  <li>Click "Reset Password" to confirm</li>
                </ol>
                
                <p><strong>Having trouble?</strong><br>
                Copy and paste this link in your browser:<br>
                <code>${resetLink || 'Check email app for link'}</code></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© MovieReview Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Send password changed confirmation email
 * @param {string} email - User's email
 * @param {string} name - User's name
 */
exports.sendPasswordChangedEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Password Changed Successfully - MovieReview",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00d084 0%, #00a86b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .cta-button { display: inline-block; background: #00d084; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Password Changed Successfully</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${name}</strong>,</p>
                
                <p>Your password has been successfully changed. You can now log in with your new password.</p>
                
                <a href="${process.env.FRONTEND_URL}/login" class="cta-button">
                  Back to Login →
                </a>
                
                <h3>Didn't change your password?</h3>
                <p>If you didn't request this change, please contact our support team immediately.</p>
                
                <p><strong>Stay Safe!</strong><br>
                The MovieReview Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password changed email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password changed email:", error);
    throw error;
  }
};
