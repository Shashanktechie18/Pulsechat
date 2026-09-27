const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ResetToken = require('../models/ResetToken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateJWT(user) {
  return jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      email: user.email
    }, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'chat-app',
      audience: 'chat-app-users'
    }
  );
}

async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body || {};
  
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  
  const existsUsername = await User.findOne({ username }).lean();
  if (existsUsername) return res.status(400).json({ error: 'Username already exists' });
  
  const existsEmail = await User.findOne({ email }).lean();
  if (existsEmail) return res.status(400).json({ error: 'Email already exists' });
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new User({ username, email, passwordHash });
  await user.save();
  
  const token = generateJWT(user);
  res.status(201).json({ 
    success: true,
    message: 'User registered successfully',
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
}

async function login(req, res) {
  const { email, username, password } = req.body || {};
  const loginField = email || username;
  
  if (!loginField || !password) {
    return res.status(400).json({ error: 'Email/username and password required' });
  }
  
  // Find user by email or username
  const user = await User.findOne({
    $or: [
      { email: loginField },
      { username: loginField }
    ]
  });
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = generateJWT(user);
  
  // Update online status
  await User.updateOne({ _id: user._id }, { $set: { online: true, connectedAt: new Date(), lastSeen: new Date() } });
  
  res.json({ 
    success: true,
    message: 'Login successful',
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
}

async function verifyToken(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      success: true,
      message: 'Token is valid',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        avatar: user.avatar,
        online: user.online,
        connectedAt: user.connectedAt,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function logout(req, res) {
  await User.updateOne({ _id: req.user.userId }, { $set: { online: false, lastSeen: new Date() } });
  res.json({ message: 'Logout successful' });
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User with this email does not exist' });
    
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await ResetToken.create({ userId: user._id, token, expiresAt });
    
    // In production send email. For now, return token in response (or log it).
    console.log('Password reset token for', user.email, token);
    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully',
      resetToken: token, 
      note: 'token logged to server console in dev' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
    
    const entry = await ResetToken.findOne({ token });
    if (!entry) return res.status(400).json({ error: 'Invalid token' });
    if (entry.expiresAt < new Date()) return res.status(400).json({ error: 'Token expired' });
    
    const user = await User.findById(entry.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    await ResetToken.deleteMany({ userId: user._id });
    
    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function resetPasswordWithToken(req, res) {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    
    if (!password || !confirmPassword) {
      return res.status(400).json({ error: 'Password and confirmPassword are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    const entry = await ResetToken.findOne({ token });
    if (!entry) return res.status(400).json({ error: 'Invalid token' });
    if (entry.expiresAt < new Date()) return res.status(400).json({ error: 'Token expired' });
    
    const user = await User.findById(entry.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();
    await ResetToken.deleteMany({ userId: user._id });
    
    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login, verifyToken, logout, forgotPassword, resetPassword, resetPasswordWithToken };
