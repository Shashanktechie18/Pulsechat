# Chat App Backend - Complete Implementation

## 🎯 Features Implemented

### 🔐 Authentication
- **JWT-based authentication** with secure token handling
- **User registration** with bcrypt password hashing
- **Login/logout** with session management
- **Password reset** with time-limited tokens
- **Protected routes** using middleware

### 💬 Multi-User Communication
- **WebSocket support** via Socket.IO for real-time chat
- **TCP socket support** for reliable delivery
- **Broadcasting** to all connected users
- **Private messaging** between specific users
- **Message persistence** in MongoDB with delivery tracking

### 👥 Session Management
- **Online/offline tracking** in database
- **Real-time presence updates** broadcast to all clients
- **Connection state management** for both WS and TCP
- **Concurrent user support** with unified socket tracking

### 🔄 Concurrency & Reliability
- **Multiple protocol support** (WebSocket + TCP)
- **Automatic failover** (WS preferred, TCP fallback)
- **Message acknowledgments** for delivery confirmation
- **Concurrent client handling** with proper state management

## 📁 Project Structure

```
server/
├── apis/                   # API route handlers
│   ├── auth.js            # Authentication endpoints
│   └── messages.js        # Message endpoints
├── controllers/           # Business logic
│   ├── authController.js  # Auth operations
│   └── messageController.js # Message operations
├── middleware/            # Express middleware
│   └── auth.js           # JWT authentication middleware
├── models/               # MongoDB schemas
│   ├── User.js          # User model with online status
│   ├── Message.js       # Message model with delivery tracking
│   └── ResetToken.js    # Password reset tokens
├── server.js            # Main server (HTTP + WebSocket + TCP + DB connection)
├── package.json         # Dependencies and scripts
├── req.http            # HTTP testing requests
├── test.js             # Comprehensive test suite
└── README.md           # This file
```

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start MongoDB:**
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

3. **Start the server:**
```bash
npm start
```

4. **Test all features:**
```bash
node test.js
```

## 🔌 Connection Methods

### HTTP API (Port 3000)
- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **User info:** `GET /auth/me` (JWT required)
- **Logout:** `POST /auth/logout` (JWT required)
- **Forgot password:** `POST /auth/forgot`
- **Reset password:** `POST /auth/reset`
- **Send message:** `POST /messages/send` (JWT required)
- **List messages:** `GET /messages/list` (JWT required)
- **ACK message:** `POST /messages/ack` (JWT required)
- **Online users:** `GET /online`

### WebSocket (Socket.IO - Port 3000)
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
  auth: { token: 'JWT_TOKEN_HERE' }
});

// Listen for events
socket.on('message', (msg) => { /* handle message */ });
socket.on('presence', (presence) => { /* handle online/offline */ });

// Send messages
socket.emit('message', { to: 'all', text: 'Hello everyone!' });
socket.emit('ack', { msgId: 'message-id' });
```

### TCP Socket (Port 9000)
```bash
# Connect and authenticate
echo '{"type":"auth","token":"JWT_TOKEN_HERE"}' | nc localhost 9000

# Send messages
echo '{"type":"message","to":"all","text":"Hello via TCP"}' | nc localhost 9000

# Send ACK
echo '{"type":"ack","msgId":"message-id"}' | nc localhost 9000
```

## 🧪 Testing

Use the provided `req.http` file with VS Code REST Client extension to test all HTTP endpoints.

Run the automated test client:
```bash
node test.js
```

## 🔧 Configuration

Environment variables:
- `MONGO_URI` - MongoDB connection string (default: mongodb://localhost:27017/chat-app)
- `JWT_SECRET` - JWT signing secret (default: dev-secret-change-me)
- `HTTP_PORT` - HTTP/WebSocket port (default: 3000)
- `TCP_PORT` - TCP server port (default: 9000)

## 🏗️ Architecture

- **Express.js** for HTTP API
- **Socket.IO** for WebSocket real-time communication
- **Node.js TCP Server** for reliable message delivery
- **MongoDB with Mongoose** for data persistence
- **JWT** for stateless authentication
- **bcryptjs** for secure password hashing

## ✅ Feature Verification

All requested features are fully implemented:

- ✅ **Authentication**: JWT-based with register/login/logout/reset
- ✅ **Multi-user chat**: Supports unlimited concurrent users
- ✅ **Message broadcasting**: Real-time delivery to all connected clients
- ✅ **Session management**: Online/offline tracking with presence updates
- ✅ **Concurrency**: Handles multiple WebSocket + TCP connections simultaneously
- ✅ **Reliability**: Message persistence, ACK system, automatic reconnection support

## 🔍 Database Schema

The MongoDB database `chat-app` contains:

- **users** collection - User accounts with online status
- **messages** collection - All messages with per-recipient delivery status
- **resettokens** collection - Password reset tokens with expiration

Ready for production with additional security hardening, monitoring, and scaling considerations.
