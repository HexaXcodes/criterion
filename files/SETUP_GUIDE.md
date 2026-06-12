# Complete Setup & Installation Guide
## Password Recovery & Welcome Email Feature

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Email Configuration](#email-configuration)
4. [Database Updates](#database-updates)
5. [Frontend Setup](#frontend-setup)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required:
- Node.js v14+ and npm
- MongoDB running locally or cloud (MongoDB Atlas)
- Gmail account (for email service) or other SMTP provider
- Git for version control

### Check versions:
```bash
node --version
npm --version
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install nodemailer crypto
```

### Step 2: Update Backend Files

Copy these files from the provided implementation:

```bash
# Replace the auth controller
cp authController_updated.js src/controllers/authController.js

# Replace the auth routes
cp authRoutes_updated.js src/routes/authRoutes.js

# Replace the User model
cp User_updated.js src/models/User.js

# Create the email utility folder if it doesn't exist
mkdir -p src/utils

# Add the email service
cp emailService.js src/utils/emailService.js
```

### Step 3: Verify File Structure

Your backend should now have:
```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js (✅ updated)
│   ├── routes/
│   │   └── authRoutes.js (✅ updated)
│   ├── models/
│   │   └── User.js (✅ updated)
│   └── utils/
│       └── emailService.js (✅ new)
└── package.json
```

---

## Email Configuration

### Step 1: Set Up Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left menu
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords" (appears after 2FA is enabled)
5. Select "Mail" and "Windows Computer" (or your OS)
6. Google will generate a 16-character password
7. Copy this password

### Step 2: Create .env File

In the `backend` directory, create a `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/moviereview
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviereview?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char password from Step 1
EMAIL_FROM_NAME=MovieReview Team

# Token Configuration
TOKEN_EXPIRY_MINUTES=15
RESET_TOKEN_EXPIRY_HOURS=24

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=5000
```

### Step 3: Verify Email Service

After creating .env, restart your server:

```bash
npm run dev
```

Watch for this message in the console:
```
✅ Email service is ready
```

If you see an error, check your Gmail credentials and 2FA setup.

---

## Database Updates

### Step 1: Export and Re-import Data (Optional)

If you have existing users, your updated User model will still work. The new fields will be added with default values.

### Step 2: Verify MongoDB Connection

```bash
# In your MongoDB client (Compass or mongosh)
use moviereview
db.users.findOne()
```

You should see the user documents. The new password recovery fields will be added automatically.

### Step 3: Create Indexes (Optional but Recommended)

For better performance with email lookups:

```javascript
// Run this in MongoDB:
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "resetTokenExpiry": 1 }, { expireAfterSeconds: 3600 })
```

---

## Frontend Setup

### Step 1: Install Axios (if not already installed)

```bash
cd frontend
npm install axios
```

### Step 2: Create Components

Create a new file: `src/components/PasswordRecoveryComponents.jsx`

Copy the entire content from `PasswordRecoveryComponents.jsx` provided.

### Step 3: Update Auth Page

Replace your auth page with the code from `Frontend_Integration_Guide.jsx`

Or manually add these imports to your existing auth page:

```javascript
import { ForgotPasswordModal, VerifyCodeModal, ResetPasswordModal } from './components/PasswordRecoveryComponents';
```

### Step 4: Add Environment Variables

Create `.env` in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com
```

### Step 5: Update Vite Config (if needed)

Ensure your `vite.config.js` has CORS configured:

```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

---

## Testing

### Step 1: Start Backend and Frontend

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 2: Test Sign Up

1. Go to http://localhost:5173/auth
2. Click "Sign Up"
3. Fill in the form with test data
4. Submit
5. Check your email for welcome message
6. Verify success message appears

### Step 3: Test Password Recovery

1. Go to http://localhost:5173/auth
2. Click "Login"
3. Click "Forgot Password?"
4. Enter your email
5. Check your email for recovery code
6. Copy the 6-digit code
7. Paste it in the verification modal
8. Enter new password
9. Verify password was reset by logging in with new password

### Step 4: Test Development Mode

In development mode, the forgot password endpoint returns the code in the response:

```json
{
  "success": true,
  "message": "Recovery code sent to your email",
  "code": "123456"  // Only in development
}
```

This is useful for quick testing. Remove this in production!

### Step 5: Use Postman to Test API

Create a Postman collection with these requests:

**1. Sign Up**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123"
}
```

**2. Forgot Password**
```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**3. Verify Code**
```
POST http://localhost:5000/api/auth/verify-reset-token
Content-Type: application/json

{
  "email": "test@example.com",
  "code": "123456"  // Use the code from step 2
}
```

**4. Reset Password**
```
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "resetToken": "token-from-step-3",
  "newPassword": "NewPassword123"
}
```

---

## Deployment

### Step 1: Update Environment Variables

For production, update your backend `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviereview
JWT_SECRET=generate-new-random-string-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=MovieReview
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=5000
```

### Step 2: Update Frontend .env

```env
VITE_API_URL=https://api.yourdomain.com
```

### Step 3: Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized production files.

### Step 4: Deploy Backend

Using Heroku, Railway, AWS, or your preferred hosting:

```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore

# Deploy
git push heroku main
```

### Step 5: Deploy Frontend

Using Vercel, Netlify, or serve from backend:

```bash
# Vercel
npm install -g vercel
vercel

# Or Netlify
npm install -g netlify-cli
netlify deploy
```

### Step 6: Enable HTTPS

Update CORS in `server.js`:

```javascript
app.use(cors({
  origin: ["https://yourdomain.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
```

---

## Troubleshooting

### Issue: Emails Not Sending

**Solution:**
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Check if Gmail 2FA is enabled
3. Verify App Password was generated (not regular password)
4. Check spam folder for emails
5. See console logs: `npm run dev` should show "✅ Email service is ready"

### Issue: "Invalid or expired reset code"

**Solution:**
1. Code expires after 15 minutes (TOKEN_EXPIRY_MINUTES in .env)
2. Ensure code is entered correctly (no spaces)
3. Request new code if expired

### Issue: Token Verification Fails

**Solution:**
1. Check JWT_SECRET matches in .env
2. Ensure token hasn't expired
3. Check browser console for actual error message

### Issue: CORS Errors

**Solution:**
In `backend/server.js`, update CORS:

```javascript
app.use(cors({
  origin: "*",  // For development only!
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
```

For production, specify your domain:

```javascript
app.use(cors({
  origin: "https://yourdomain.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
```

### Issue: Database Connection Error

**Solution:**
1. Verify MongoDB is running: `mongod`
2. Check MONGODB_URI in .env
3. For MongoDB Atlas, ensure IP whitelist includes your IP
4. Test connection in MongoDB Compass

### Issue: "Email service error"

**Solution:**
1. Check EMAIL_SERVICE setting (usually "gmail")
2. Verify credentials
3. Check Gmail account security settings
4. Try using a different email provider (SendGrid, AWS SES)

---

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a random string
- [ ] Enable HTTPS on frontend and backend
- [ ] Update CORS origin to your domain only
- [ ] Remove development code from auth controller (the `code` return in response)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on password reset endpoints
- [ ] Set strong password requirements
- [ ] Implement CSRF protection
- [ ] Use secure cookies for tokens
- [ ] Enable MongoDB authentication
- [ ] Use `.env.example` instead of `.env` in git

---

## Performance Optimization

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// In authRoutes.js
const rateLimit = require("express-rate-limit");

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  message: "Too many password reset attempts, please try again later"
});

router.post("/forgot-password", passwordResetLimiter, forgotPassword);
```

### Add Email Queue (for high traffic)

For production with many users, consider using Bull or RabbitMQ for email queuing:

```bash
npm install bull redis
```

This prevents email sending from blocking API responses.

---

## Support Resources

- Nodemailer Docs: https://nodemailer.com/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- OWASP Password Reset: https://cheatsheetseries.owasp.org/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833

---

## Success Checklist

After following this guide, you should have:

- ✅ Welcome emails sent on signup
- ✅ Password recovery via email code
- ✅ Secure token-based reset flow
- ✅ Email templates with branding
- ✅ Working frontend UI for password recovery
- ✅ API endpoints tested and working
- ✅ Error handling and validation
- ✅ Security best practices implemented

Congratulations! 🎉 Your password recovery system is ready!
