const User = require('../models/User');

// Get current user profile
async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        online: user.online
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select('username email avatar online');
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        online: user.online
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all online users
async function online(req, res) {
  try {
    const onlineUsers = await User.find({ online: true }).select('username email avatar');
    res.json({
      success: true,
      users: onlineUsers.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update user profile
async function updateProfile(req, res) {
  try {
    const { username, avatar } = req.body;
    const updateData = {};
    
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.userId } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      updateData, 
      { new: true }
    ).select('-passwordHash');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        online: user.online
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { me, getAllUsers, online, updateProfile };