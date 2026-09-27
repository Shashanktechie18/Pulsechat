const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  online: { type: Boolean, default: false },
  connectedAt: { type: Date },
  lastSeen: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('User', UserSchema);
