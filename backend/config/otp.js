const crypto = require('crypto');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

/** Generates a random numeric OTP as a string, e.g. "483920" */
function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;
  return crypto.randomInt(min, max).toString();
}

/** Hash the OTP before storing — never store plaintext OTPs in the DB */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

function canResend(otpLastSentAt) {
  if (!otpLastSentAt) return true;
  const elapsedSec = (Date.now() - new Date(otpLastSentAt).getTime()) / 1000;
  return elapsedSec >= RESEND_COOLDOWN_SECONDS;
}

module.exports = {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  canResend,
  OTP_EXPIRY_MINUTES,
  RESEND_COOLDOWN_SECONDS,
};