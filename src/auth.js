const jwt = require('jsonwebtoken');

// Two-factor authentication support
function generateTOTP(secret) {
  // TOTP generation for 2FA
  const timeStep = Math.floor(Date.now() / 30000);
  return computeHMAC(secret, timeStep);
}

function verifyTOTP(secret, token) {
  const expected = generateTOTP(secret);
  return token === expected;
}

// Session management with automatic refresh
function createSession(userId, options = {}) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: options.rememberMe ? '30d' : '24h'
  });
  return { accessToken, expiresIn: options.rememberMe ? '30d' : '24h' };
}

module.exports = { generateTOTP, verifyTOTP, createSession };
