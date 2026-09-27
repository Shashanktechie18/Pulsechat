import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user, token } = useAuth();

  const isBrowser = typeof window !== 'undefined';
  const isLocalHostRuntime =
    isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localDefaultSocketOrigin = 'http://localhost:5000';
  const productionDefaultSocketOrigin = 'https://namaste-messenger.onrender.com';
  const configuredSocketOrigin = import.meta.env.VITE_SOCKET_URL || productionDefaultSocketOrigin;
  const localSocketOrigin = import.meta.env.VITE_SOCKET_URL_LOCAL || localDefaultSocketOrigin;
  const socketOrigin = isLocalHostRuntime ? localSocketOrigin : configuredSocketOrigin;

  useEffect(() => {
    if (user && token) {
      const newSocket = io(socketOrigin, {
        auth: {
          token: token,
          userId: user.id,
          username: user.username
        }
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join the user to their room
        newSocket.emit('join', {
          userId: user.id,
          username: user.username
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // Online users handlers
      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users || []);
      });

      newSocket.on('userJoined', (userData) => {
        console.log('User joined:', userData);
        setOnlineUsers(prev => {
          const filtered = prev.filter(u => u.id !== userData.id);
          return [...filtered, userData];
        });
      });

      newSocket.on('userLeft', (userData) => {
        console.log('User left:', userData);
        setOnlineUsers(prev => prev.filter(u => u.id !== userData.id));
      });

      newSocket.on('presence', (data) => {
        console.log('Presence update:', data);
        // Handle presence updates if needed
        if (data.status === 'online' && data.username) {
          // This is handled by userJoined event instead
        }
      });

      // Typing indicators
      newSocket.on('userTyping', ({ userId, username, isTyping }) => {
        console.log('Typing event received:', { userId, username, isTyping });
        setTypingUsers(prev => {
          if (isTyping) {
            if (!prev.find(u => u.id === userId)) {
              return [...prev, { id: userId, username: username }];
            }
          } else {
            return prev.filter(u => u.id !== userId);
          }
          return prev;
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers([]);
      };
    }
  }, [socketOrigin, user, token]);

  // Socket helper functions
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', messageData);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const emitTyping = (isTyping, chatType = 'general', chatId = null) => {
    if (socket && isConnected && user) {
      socket.emit('typing', {
        isTyping: isTyping,
        chatType: chatType,
        chatId: chatId
      });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};