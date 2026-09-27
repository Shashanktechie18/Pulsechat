const express = require('express');
const router = express.Router();
const { me, getAllUsers, online, updateProfile } = require('../controllers/userController');
const jwtMiddleware = require('../middleware/auth');

// Get current user profile
router.get('/me', jwtMiddleware, me);

// Get all users
router.get('/', jwtMiddleware, getAllUsers);

// Get all online users
router.get('/online', jwtMiddleware, online);

// Update user profile
router.put('/profile', jwtMiddleware, updateProfile);

module.exports = router;