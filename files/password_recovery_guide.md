# Account Recovery & Welcome Email Implementation Guide

## Overview
This guide implements account recovery (forgot password) with email verification and a welcome message for new users.

## Features Implemented
1. ✅ Password recovery with email verification code
2. ✅ Welcome email on signup
3. ✅ Token-based password reset
4. ✅ Secure token generation and expiration
5. ✅ Email service integration (Nodemailer)

---

## STEP 1: Install Dependencies

```bash
cd backend
npm install nodemailer crypto
```

---

## STEP 2: Backend Implementation

### A. Update User Model (src/models/User.js)

Add these fields to store recovery tokens:

```javascript
// Add to userSchema before timestamps
resetToken: {
  type: String,
  default: null
},
resetTokenExpiry: {
  type: Date,
  default: null
},
isEmailVerified: {
  type: Boolean,
  default: false
},
emailVerificationToken: {
  type: String,
  default: null
},
emailVerificationExpiry: {
  type: Date,
  default: null
}
```

### B. Create Email Service (src/utils/emailService.js)

This handles all email sending logic.

### C. Update Auth Controller (src/controllers/authController.js)

Add these methods:
- `forgotPassword` - Send recovery email
- `verifyResetToken` - Verify the recovery code
- `resetPassword` - Update password with valid token

### D. Update Auth Routes (src/routes/authRoutes.js)

Add new routes:
- `POST /forgot-password` - Request recovery email
- `POST /verify-reset-token` - Verify recovery code
- `POST /reset-password` - Set new password

### E. Create Verification Middleware

Protect password reset endpoints from abuse.

---

## STEP 3: Environment Variables

Add to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail  # or your email provider
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Password for Gmail
EMAIL_FROM_NAME=MovieReview Team

# Email Verification
TOKEN_EXPIRY_MINUTES=15
RESET_TOKEN_EXPIRY_HOURS=24

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup Instructions:
1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for Node.js
4. Use this password in `EMAIL_PASSWORD`

---

## STEP 4: Frontend Implementation

### Components Needed:
1. **ForgotPasswordModal** - Request recovery email
2. **VerifyCodeModal** - Verify recovery code
3. **ResetPasswordModal** - Set new password
4. **SuccessNotification** - Show welcome/success messages

### Flow:
1. User clicks "Forgot Password" → ForgotPasswordModal
2. Enter email → Code sent to email
3. Enter code → VerifyCodeModal  
4. If valid → ResetPasswordModal
5. Set new password → Success message

---

## STEP 5: Email Templates

### Welcome Email (On Signup)
```html
<h1>Welcome to MovieReview!</h1>
<p>Hi [NAME],</p>
<p>Welcome to our movie review community! 🎬</p>
<p>Start exploring movies, writing reviews, and connecting with film enthusiasts.</p>
<a href="[FRONTEND_URL]/login">Login to Your Account</a>
```

### Password Recovery Email
```html
<h1>Password Recovery</h1>
<p>Hi [NAME],</p>
<p>We received a request to reset your password.</p>
<p><strong>Your recovery code:</strong></p>
<h2>[6-DIGIT CODE]</h2>
<p>This code expires in 15 minutes.</p>
<a href="[FRONTEND_URL]/reset-password?code=[CODE]">Reset Password</a>
```

---

## Security Best Practices

✅ **Token Expiration**: Tokens expire after 15-24 hours
✅ **Rate Limiting**: Implement rate limiting on password reset requests
✅ **Secure Tokens**: Using crypto for random token generation
✅ **No User Enumeration**: Don't reveal if email exists
✅ **HTTPS Only**: Use secure connections in production
✅ **Password Hashing**: Using bcrypt for password storage

---

## API Endpoints

### 1. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "Recovery email sent successfully",
  "success": true
}
```

### 2. Verify Recovery Code
```http
POST /api/auth/verify-reset-token
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "message": "Code verified successfully",
  "token": "reset-token-jwt",
  "success": true
}
```

### 3. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token-jwt",
  "newPassword": "newSecurePassword123"
}

Response:
{
  "message": "Password reset successfully",
  "success": true
}
```

---

## Testing

### Manual Testing Steps:
1. Signup with email
2. Check email for welcome message
3. Click "Forgot Password"
4. Enter email → check email for recovery code
5. Enter code in verification modal
6. Set new password
7. Login with new password ✅

### Using Postman/Insomnia:
1. Create collection for auth endpoints
2. Test each endpoint sequentially
3. Verify database updates (tokens, expiry)
4. Check email inbox for messages

---

## Troubleshooting

### Emails not sending?
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail App Password (not regular password)
- Check spam folder
- Enable "Less secure app access" if needed

### Token expired errors?
- Verify TOKEN_EXPIRY_MINUTES is reasonable (15-30 min recommended)
- Check server system time is correct
- Tokens expire server-side, not just in DB

### Code not matching?
- Ensure backend and frontend codes match exactly
- Check for whitespace in code input
- Verify token hasn't expired

---

## Next Steps

1. ✅ Implement all backend files
2. ✅ Configure email service in .env
3. ✅ Create frontend components
4. ✅ Test password recovery flow
5. ✅ Add rate limiting (optional but recommended)
6. ✅ Deploy with HTTPS
7. ✅ Monitor email delivery

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js (updated)
│   ├── routes/
│   │   └── authRoutes.js (updated)
│   ├── models/
│   │   └── User.js (updated)
│   └── utils/
│       └── emailService.js (new)
└── .env (updated)

frontend/
├── src/
│   ├── components/
│   │   ├── ForgotPasswordModal.jsx (new)
│   │   ├── VerifyCodeModal.jsx (new)
│   │   ├── ResetPasswordModal.jsx (new)
│   │   └── Auth components (updated)
│   └── pages/
│       └── AuthPage.jsx (updated)
```

---

## Support

For issues or questions:
1. Check email service configuration
2. Verify all environment variables
3. Check browser console for errors
4. Check backend logs for API errors
5. Ensure MongoDB is running
