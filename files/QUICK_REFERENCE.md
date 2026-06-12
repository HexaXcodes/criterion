# Password Recovery & Welcome Email - Quick Reference Guide

## 🎯 What You're Getting

A complete, production-ready password recovery system with:
- ✅ Welcome emails on signup
- ✅ Password recovery via 6-digit code
- ✅ Secure JWT-based reset flow
- ✅ Beautiful email templates
- ✅ Complete React frontend components
- ✅ Rate limiting ready
- ✅ Security best practices

---

## 📁 Files Provided

### Backend Implementation
| File | Purpose |
|------|---------|
| `emailService.js` | Email sending utility |
| `authController_updated.js` | Auth logic with recovery methods |
| `authRoutes_updated.js` | API endpoints |
| `User_updated.js` | Database schema with recovery fields |
| `UtilityHelpers.js` | Helper functions |

### Frontend Implementation
| File | Purpose |
|------|---------|
| `PasswordRecoveryComponents.jsx` | React modals & forms |
| `Frontend_Integration_Guide.jsx` | Complete auth page example |
| `usePasswordRecovery.js` | React custom hook |

### Documentation
| File | Purpose |
|------|---------|
| `password_recovery_guide.md` | Feature overview |
| `SETUP_GUIDE.md` | Step-by-step installation |
| `this file` | Quick reference |

---

## ⚡ Quick Start (5 Minutes)

### 1. Backend Setup
```bash
cd backend
npm install nodemailer crypto

# Copy files
cp authController_updated.js src/controllers/authController.js
cp authRoutes_updated.js src/routes/authRoutes.js
cp User_updated.js src/models/User.js
mkdir -p src/utils && cp emailService.js src/utils/
```

### 2. Environment Setup
Create `backend/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=MovieReview Team
FRONTEND_URL=http://localhost:5173
TOKEN_EXPIRY_MINUTES=15
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy component
cp PasswordRecoveryComponents.jsx src/components/
```

### 4. Run & Test
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Visit http://localhost:5173
```

---

## 📧 Email Flow

### Sign Up
```
User → Fill form → Click Sign Up
         ↓
      Backend: Hash password, create user
         ↓
      Send Welcome Email
         ↓
      User: Check inbox 📬
```

### Password Recovery
```
User → Click "Forgot Password" → Enter email
         ↓
      Backend: Generate 6-digit code, send email
         ↓
      User: Copy code from email
         ↓
      User: Paste code in modal
         ↓
      Backend: Verify code, generate reset token
         ↓
      User: Enter new password
         ↓
      Backend: Hash and update password
         ↓
      Send confirmation email
         ↓
      User: Login with new password ✅
```

---

## 🔑 API Endpoints

### Public Endpoints

#### Sign Up
```http
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
Response:
```json
{
  "success": true,
  "message": "User registered successfully!"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
{
  "email": "john@example.com"
}
```
Response (Dev Mode):
```json
{
  "success": true,
  "message": "Recovery code sent to your email",
  "code": "123456"
}
```

#### Verify Code
```http
POST /api/auth/verify-reset-token
{
  "email": "john@example.com",
  "code": "123456"
}
```
Response:
```json
{
  "success": true,
  "resetToken": "jwt-token-here"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
{
  "email": "john@example.com",
  "resetToken": "jwt-token",
  "newPassword": "NewPass123"
}
```
Response:
```json
{
  "success": true,
  "message": "Password reset successfully!"
}
```

#### Login
```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "NewPass123"
}
```

---

## 🎨 Frontend Components Usage

### Simple Usage
```jsx
import { ForgotPasswordModal, VerifyCodeModal, ResetPasswordModal } from './PasswordRecoveryComponents';

function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowForgot(true)}>
        Forgot Password?
      </button>
      
      <ForgotPasswordModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        onSuccess={(email) => {
          // Move to verify code modal
        }}
      />
    </>
  );
}
```

### Using the Hook
```jsx
import { usePasswordRecovery } from './hooks/usePasswordRecovery';

function PasswordReset() {
  const { 
    loading, 
    error, 
    success,
    requestPasswordReset 
  } = usePasswordRecovery();

  const handleReset = async (email) => {
    const result = await requestPasswordReset(email);
    if (result.success) {
      // Success handling
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {/* Your form */}
    </div>
  );
}
```

---

## 🔒 Security Features

✅ **Password Hashing**: bcrypt with salt rounds 10
✅ **Token Expiration**: 15 minutes for codes, 1 hour for reset tokens
✅ **Rate Limiting**: 3 attempts per 15 minutes
✅ **No User Enumeration**: Same response for existing/non-existing emails
✅ **HTTPS Ready**: Full HTTPS support in production
✅ **Secure Tokens**: Using crypto.randomBytes for generation
✅ **JWT Signing**: Secret-based token validation
✅ **Email Verification**: SMTP validation before sending

---

## 🧪 Testing Checklist

- [ ] Sign up creates account
- [ ] Welcome email received
- [ ] Forgot password sends code
- [ ] Code verification works
- [ ] Password reset updates database
- [ ] New password works for login
- [ ] Old password doesn't work
- [ ] Expired codes rejected
- [ ] Invalid codes rejected
- [ ] Email templates render correctly
- [ ] Error messages display
- [ ] Success messages display
- [ ] Rate limiting works
- [ ] CORS works with frontend

---

## 🐛 Common Issues & Fixes

### Emails Not Sending
```
❌ Problem: "Error: unable to verify the first certificate"
✅ Fix: Your SMTP credentials are wrong. Check EMAIL_USER and EMAIL_PASSWORD

❌ Problem: "Error: Invalid credentials"
✅ Fix: For Gmail, you need App Password (not regular password)

❌ Problem: No emails even with correct credentials
✅ Fix: Check .env FRONTEND_URL is correct
```

### Code Not Working
```
❌ Problem: "Invalid recovery code"
✅ Fix: 
  1. Make sure code wasn't entered with spaces
  2. Check code isn't expired (15 min timeout)
  3. Request new code if needed

❌ Problem: "resetToken is undefined"
✅ Fix: Verify code first before trying to reset password
```

### Frontend Issues
```
❌ Problem: CORS errors
✅ Fix: Check VITE_API_URL in .env matches backend URL

❌ Problem: Components not rendering
✅ Fix: Ensure PasswordRecoveryComponents.jsx is in src/components/

❌ Problem: Axios import error
✅ Fix: Run "npm install axios" in frontend
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  preferences: {
    genres: [String],
    languages: [String],
    favoriteActors: [String]
  },
  watchedMovies: [ObjectId],
  watchlist: [ObjectId],
  streak: {
    count: Number,
    lastLogin: Date
  },
  points: Number,
  
  // Password recovery fields
  resetToken: String,          // Hashed recovery code
  resetTokenExpiry: Date,      // When code expires
  isEmailVerified: Boolean,    // For future use
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in .env
- [ ] Disable development code in authController.js (remove `code` from response)
- [ ] Enable rate limiting on all auth endpoints
- [ ] Set HTTPS in CORS configuration
- [ ] Update FRONTEND_URL to production domain
- [ ] Use strong email credentials
- [ ] Configure email provider (SendGrid, AWS SES) for scale
- [ ] Add monitoring/logging for failed emails
- [ ] Test all email templates
- [ ] Implement CSRF protection
- [ ] Add request validation
- [ ] Enable Morgan logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure backup email service
- [ ] Document password requirements for users
- [ ] Add privacy policy about data handling

---

## 📞 Need Help?

### Check These First
1. Console logs - Backend should show "✅ Email service is ready"
2. Network tab - Check actual API responses
3. Email spam folder - Sometimes emails land there
4. .env file - Ensure all variables are set
5. Error messages - They often contain the solution

### Enable Debug Logs
Add to backend .env:
```env
DEBUG=*
```

### Test Email Service
```bash
# Create a test-email.js file
const emailService = require('./src/utils/emailService');

emailService.sendWelcomeEmail('test@example.com', 'Test User')
  .then(() => console.log('✅ Email sent!'))
  .catch(err => console.log('❌ Error:', err.message));

node test-email.js
```

---

## 📚 Further Reading

- [Nodemailer Documentation](https://nodemailer.com/)
- [OWASP Password Reset Guide](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [React Hooks Documentation](https://react.dev/reference/react)

---

## 🎉 You're All Set!

Your password recovery system is ready to:
- Welcome new users
- Help users recover their accounts
- Keep data secure
- Handle errors gracefully
- Scale to production

**Next Steps:**
1. Follow the SETUP_GUIDE.md for detailed installation
2. Test all endpoints using Postman
3. Customize email templates with your branding
4. Deploy to production with confidence

**Questions?** Check the documentation files provided or review the code comments.

Happy coding! 🚀
