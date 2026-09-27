const { Schema, model } = require('mongoose');

const RecipientSchema = new Schema({
  username: {
     type: String,
     required: true },
  delivered: { type: Boolean,
     default: false 
  },
  deliveredAt: { type: Date },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: { type: Date },
});

const ReplySchema = new Schema(
  {
    id: { type: String },
    content: { type: String },
    senderUsername: { type: String },
  },
  { _id: false }
);

const MessageSchema = new Schema({
  msgId: { type: String, required: true, unique: true, index: true },
  from: { type: String, required: true },
  to: { type: String, default: 'all' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  recipients: { type: [RecipientSchema], default: [] },
  type: { type: String, enum: ['general', 'direct'], default: 'general' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  replyTo: { type: ReplySchema, default: null },
});

module.exports = model('Message', MessageSchema);
