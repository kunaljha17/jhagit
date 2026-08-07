const nodemailer = require('nodemailer');

// Works with Gmail SMTP, Resend, Brevo, SendGrid SMTP relay, etc.
// For Gmail: use an "App Password", not your normal password.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>jhaGit — Verify your email</h2>
      <p>Use the code below to verify your account. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"jhaGit" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your jhaGit verification code',
    html,
    text: `Your jhaGit verification code is: ${otp} (expires in 10 minutes)`,
  });
}

module.exports = { sendOtpEmail };