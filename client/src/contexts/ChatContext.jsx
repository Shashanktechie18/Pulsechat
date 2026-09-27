import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const normalizeMessage = useCallback((message) => {
    if (!message) return message;
    return {
      ...message,
      delivered: Boolean(message.delivered),
      read: Boolean(message.read),
      replyTo: message.replyTo || null,
    };
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/messages/history');
      if (response.data.success) {
        setMessages((response.data.messages || []).map(normalizeMessage));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [normalizeMessage]);

  // Load initial messages
  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user, loadMessages]);

  // Listen for new messages from socket
  useEffect(() => {
    if (socket && user) {
      const handleNewMessage = (message) => {
        const normalizedMessage = normalizeMessage(message);

        // Add message only if it doesn't already exist (prevent duplicates)
        setMessages(prev => {
          const exists = prev.find(msg => 
            (msg.id === normalizedMessage.id || msg.msgId === normalizedMessage.msgId) ||
            (msg.content === normalizedMessage.content && 
             msg.senderId === normalizedMessage.senderId && 
             Math.abs(new Date(msg.timestamp || msg.createdAt) - new Date(normalizedMessage.timestamp || normalizedMessage.createdAt)) < 5000)
          );

          if (exists) {
            // Keep existing object but merge live status updates.
            return prev.map(msg => {
              if (msg.id === normalizedMessage.id || msg.msgId === normalizedMessage.msgId) {
                return {
                  ...msg,
                  delivered: normalizedMessage.delivered || msg.delivered,
                  read: normalizedMessage.read || msg.read,
                };
              }
              return msg;
            });
          }

          return [...prev, normalizedMessage];
        });

        // Notify server that recipient received the message.
        if (
          normalizedMessage.msgId &&
          normalizedMessage.senderId &&
          normalizedMessage.type === 'direct' &&
          String(normalizedMessage.senderId) !== String(user.id)
        ) {
          socket.emit('message:delivered', { msgId: normalizedMessage.msgId });
        }
      };

      const handleMessageStatusUpdate = (statusPayload) => {
        const { msgId, delivered, deliveredAt, read, readAt } = statusPayload || {};
        if (!msgId) return;

        setMessages(prev =>
          prev.map(msg => {
            if (msg.msgId !== msgId) {
              return msg;
            }

            return {
              ...msg,
              delivered: typeof delivered === 'boolean' ? delivered : msg.delivered,
              deliveredAt: deliveredAt || msg.deliveredAt || null,
              read: typeof read === 'boolean' ? read : msg.read,
              readAt: readAt || msg.readAt || null,
            };
          })
        );
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('messageStatusUpdate', handleMessageStatusUpdate);

      socket.on('messageDelivered', (data) => {
        // Message accepted by server (sender-side only).
        console.log('Message delivered:', data);
      });

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageStatusUpdate', handleMessageStatusUpdate);
        socket.off('messageDelivered');
      };
    }
  }, [socket, user]);

  const sendMessage = async (messageData) => {
    if (!messageData.content?.trim()) return;

    try {
      // Send ONLY via socket for real-time delivery
      if (socket && isConnected) {
        socket.emit('newMessage', {
          content: messageData.content.trim(),
          recipientId: messageData.recipientId,
          type: messageData.type || 'general',
          replyTo: messageData.replyTo || null,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    }
  };

  const retryMessage = async (message) => {
    if (message.tempId) {
      // Update status to sending
      setMessages(prev =>
        prev.map(msg =>
          msg.tempId === message.tempId
            ? { ...msg, status: 'sending', error: null }
            : msg
        )
      );

      // Retry sending
      await sendMessage(message);
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => 
      msg.id !== messageId && msg.tempId !== messageId
    ));
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.post(`/messages/read/${messageId}`);
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getMessagesForUser = (userId) => {
    return messages.filter(msg =>
      (msg.senderId === userId && msg.recipientId === user.id) ||
      (msg.senderId === user.id && msg.recipientId === userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getGeneralMessages = () => {
    return messages.filter(msg => !msg.recipientId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const addDemoMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const value = {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
    deleteMessage,
    markAsRead,
    clearMessages,
    loadMessages,
    getMessagesForUser,
    getGeneralMessages,
    addDemoMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};