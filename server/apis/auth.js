const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const jwtMiddleware = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/verify', jwtMiddleware, ctrl.verifyToken);
router.post('/logout', jwtMiddleware, ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/reset-password/:token', ctrl.resetPasswordWithToken);

module.exports = router;
