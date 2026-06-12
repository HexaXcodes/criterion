require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Email Service...\n');

// Check .env variables
console.log('📋 Checking environment variables:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);

console.log('\n🔌 Connecting to email service...\n');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ CONNECTION FAILED:');
    console.log('Error:', error.message);
    
    if (error.message.includes('Invalid login') || error.message.includes('credentials')) {
      console.log('\n💡 FIX: You\'re using the wrong password!');
      console.log('   Go to: https://myaccount.google.com/apppasswords');
      console.log('   1. Make sure 2-Factor Authentication is ON');
      console.log('   2. Select Mail + Windows Computer');
      console.log('   3. Copy the 16-character password');
      console.log('   4. Paste it in .env as EMAIL_PASSWORD (with spaces)');
    }
    return;
  }
  
  console.log('✅ Connection successful!');
  console.log('\nSending test email...\n');
  
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: '✅ MovieReview Email Test',
    text: 'If you see this, email service is working!',
    html: '<h1>✅ Email Service Works!</h1><p>Check spam folder if you don\'t see welcome emails in your app.</p>'
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ SEND FAILED:', error.message);
      return;
    }
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Check your inbox:', process.env.EMAIL_USER);
    console.log('\n✨ Your email service is working correctly!\n');
  });
});
