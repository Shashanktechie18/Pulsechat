import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../contexts/ChatContext';
import useVideoCall from '../hooks/useVideoCall';
import VideoCallModal from '../components/VideoCallModal';
import CreateGroupModal from '../components/CreateGroupModal';

const quickEmojis = ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '😭', '👍', '🙏', '🔥', '🎉', '❤️'];
const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const chatFilters = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'online', label: 'Online' },
];

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { messages: contextMessages, sendMessage } = useChat();

  const [activeChat, setActiveChat] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [generalUnread, setGeneralUnread] = useState(0);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupMessages, setGroupMessages] = useState({});
  const [activeReactionTarget, setActiveReactionTarget] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const readMessageIdsRef = useRef(new Set());
  const groupsLoadedRef = useRef(false);

  const {
    callState,
    callMode,
    callScope,
    incomingCall,
    activeCallUser,
    remoteParticipants,
    callError,
    clearCallError,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isCameraOff,
    startCall,
    startAudioCall,
    startGroupCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useVideoCall({ socket, currentUser: user });

  const messages = useMemo(() => {
    return [...contextMessages].sort(
      (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
    );
  }, [contextMessages]);

  const onlineUserIds = useMemo(
    () => new Set((onlineUsers || []).map((onlineUser) => String(onlineUser.id))),
    [onlineUsers]
  );

  const directUsers = useMemo(() => {
    const mergedUsers = new Map();

    (allUsers || []).forEach((entry) => {
      const userId = String(entry.id);
      if (userId === String(user?.id)) return;
      mergedUsers.set(userId, {
        ...entry,
        id: userId,
        online: onlineUserIds.has(userId),
      });
    });

    (onlineUsers || []).forEach((entry) => {
      const userId = String(entry.id);
      if (userId === String(user?.id)) return;

      const existing = mergedUsers.get(userId) || {};
      mergedUsers.set(userId, {
        ...existing,
        ...entry,
        id: userId,
        username: entry.username || existing.username || 'User',
        online: true,
      });
    });

    return Array.from(mergedUsers.values()).sort((a, b) => {
      if (a.online !== b.online) {
        return Number(b.online) - Number(a.online);
      }
      return (a.username || '').localeCompare(b.username || '');
    });
  }, [allUsers, onlineUserIds, onlineUsers, user?.id]);

  const userDirectory = useMemo(() => {
    const directory = new Map();

    (allUsers || []).forEach((entry) => {
      const userId = String(entry.id);
      directory.set(userId, {
        ...entry,
        id: userId,
        online: onlineUserIds.has(userId),
      });
    });

    if (user?.id) {
      const userId = String(user.id);
      const existing = directory.get(userId) || {};
      directory.set(userId, {
        ...existing,
        id: userId,
        username: user.username || user.name || existing.username || 'You',
        online: onlineUserIds.has(userId),
      });
    }

    return directory;
  }, [allUsers, onlineUserIds, user]);

  const activeDirectUser = useMemo(
    () => directUsers.find((entry) => String(entry.id) === String(activeChat)),
    [directUsers, activeChat]
  );

  const searchedDirectUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return directUsers;
    return directUsers.filter((entry) => (entry.username || '').toLowerCase().includes(query));
  }, [directUsers, userSearch]);

  const unreadDirectTotal = useMemo(
    () => Object.values(unreadCounts).reduce((total, count) => total + count, 0),
    [unreadCounts]
  );

  const groupCallTargets = useMemo(() => {
    return directUsers
      .filter((entry) => entry.online)
      .map((entry) => ({ id: String(entry.id), username: entry.username }));
  }, [directUsers]);

  const filteredDirectUsers = useMemo(() => {
    if (chatFilter === 'all') return searchedDirectUsers;
    if (chatFilter === 'unread') {
      return searchedDirectUsers.filter((entry) => (unreadCounts[String(entry.id)] || 0) > 0);
    }
    if (chatFilter === 'online') {
      return searchedDirectUsers.filter((entry) => entry.online);
    }
    return searchedDirectUsers;
  }, [chatFilter, searchedDirectUsers, unreadCounts]);

  const groupsWithMeta = useMemo(() => {
    return (groups || []).map((group) => {
      const memberIds = (group.members || []).map((id) => String(id));
      const members = memberIds.map((id) => {
        return (
          userDirectory.get(id) || {
            id,
            username: 'Member',
            online: false,
          }
        );
      });

      const onlineCount = members.filter((member) => member.online).length;

      return {
        ...group,
        memberIds,
        members,
        onlineCount,
        memberCount: memberIds.length,
      };
    });
  }, [groups, userDirectory]);

  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return groupsWithMeta.find((group) => group.id === activeGroupId) || null;
  }, [activeGroupId, groupsWithMeta]);

  const generalThreadMeta = useMemo(() => {
    let latestMessage = null;

    messages.forEach((message) => {
      const isGeneral = message.type === 'general' || !message.recipientId;
      if (!isGeneral) return;

      const stamp = message.createdAt || message.timestamp;
      const ts = new Date(stamp).getTime();
      if (Number.isNaN(ts)) return;

      if (!latestMessage) {
        latestMessage = message;
        return;
      }

      const prev = new Date(latestMessage.createdAt || latestMessage.timestamp).getTime();
      if (ts > prev) {
        latestMessage = message;
      }
    });

    return latestMessage;
  }, [messages]);

  const directThreadMeta = useMemo(() => {
    const threadMap = {};
    if (!user) return threadMap;

    const myId = String(user.id);

    messages.forEach((message) => {
      if (message.type !== 'direct') return;

      const senderId = String(message.senderId || '');
      const recipientId = String(message.recipientId || '');
      if (senderId !== myId && recipientId !== myId) return;

      const peerId = senderId === myId ? recipientId : senderId;
      if (!peerId) return;

      const stamp = message.createdAt || message.timestamp;
      const ts = new Date(stamp).getTime();
      if (Number.isNaN(ts)) return;

      if (!threadMap[peerId] || ts > threadMap[peerId].ts) {
        threadMap[peerId] = {
          content: message.content || '',
          ts,
          fromMe: senderId === myId,
        };
      }
    });

    return threadMap;
  }, [messages, user]);

  const filteredMessages = useMemo(() => {
    if (!user) return [];

    if (activeChat === 'general') {
      return messages.filter((message) => message.type === 'general' || !message.recipientId);
    }

    return messages.filter((message) => {
      const senderId = String(message.senderId || '');
      const recipientId = String(message.recipientId || '');
      const me = String(user.id);
      const peer = String(activeChat);

      return (senderId === me && recipientId === peer) || (senderId === peer && recipientId === me);
    });
  }, [activeChat, messages, user]);

  const visibleMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    if (!query) return filteredMessages;

    return filteredMessages.filter((message) => {
      const body = (message.content || '').toLowerCase();
      const replyBody = (message.replyTo?.content || '').toLowerCase();
      return body.includes(query) || replyBody.includes(query);
    });
  }, [filteredMessages, messageSearch]);

  const activeGroupMessages = useMemo(() => {
    if (!activeGroupId) return [];
    return groupMessages[activeGroupId] || [];
  }, [activeGroupId, groupMessages]);

  const visibleGroupMessages = useMemo(() => {
    if (!activeGroupId) return [];
    const query = messageSearch.trim().toLowerCase();
    if (!query) return activeGroupMessages;

    return activeGroupMessages.filter((message) => {
      const body = (message.content || '').toLowerCase();
      const replyBody = (message.replyTo?.content || '').toLowerCase();
      return body.includes(query) || replyBody.includes(query);
    });
  }, [activeGroupId, activeGroupMessages, messageSearch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleGroupMessages, visibleMessages, typingUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        setLoadingUsers(true);
        const response = await axios.get('/users');
        if (response.data?.success) {
          setAllUsers(response.data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;

    const storageKey = `echo.groups.${user.id}`;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGroups(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load groups from storage:', error);
    } finally {
      groupsLoadedRef.current = true;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;
    if (!groupsLoadedRef.current) return;

    const storageKey = `echo.groups.${user.id}`;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(groups));
    } catch (error) {
      console.warn('Failed to save groups to storage:', error);
    }
  }, [groups, user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleTypingEvent = ({ username: typingUsername, isTyping: typing, chatType, chatId }) => {
      if (chatType === 'general' && activeChat === 'general') {
        setTypingUsers((prev) => {
          if (typing) {
            return prev.includes(typingUsername) ? prev : [...prev, typingUsername];
          }
          return prev.filter((entry) => entry !== typingUsername);
        });
      }

      if (chatType === 'direct' && String(chatId) === String(activeChat)) {
        setTypingUsers((prev) => {
          if (typing) {
            return prev.includes(typingUsername) ? prev : [...prev, typingUsername];
          }
          return prev.filter((entry) => entry !== typingUsername);
        });
      }
    };

    socket.on('userTyping', handleTypingEvent);
    return () => {
      socket.off('userTyping', handleTypingEvent);
    };
  }, [socket, activeChat]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleUnreadMessages = (message) => {
      if (!message) return;
      if (String(message.senderId) === String(user.id)) return;

      const isGeneral = message.type === 'general' || !message.recipientId;
      if (isGeneral) {
        if (activeChat !== 'general') {
          setGeneralUnread((prev) => prev + 1);
        }
        return;
      }

      if (message.type !== 'direct') return;

      const senderChatId = String(message.senderId || '');
      if (senderChatId && senderChatId !== String(activeChat)) {
        setUnreadCounts((prev) => ({
          ...prev,
          [senderChatId]: (prev[senderChatId] || 0) + 1,
        }));
      }
    };

    socket.on('newMessage', handleUnreadMessages);
    return () => {
      socket.off('newMessage', handleUnreadMessages);
    };
  }, [socket, user, activeChat]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission()
        .then((permission) => {
          setNotificationPermission(permission);
        })
        .catch((error) => {
          console.warn('Notification permission request failed:', error);
        });
      return;
    }

    setNotificationPermission(Notification.permission);
  }, []);

  const triggerBrowserNotification = useCallback(
    (title, body) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (notificationPermission !== 'granted') return;
      if (!document.hidden) return;

      const note = new Notification(title, {
        body,
        icon: '/vite.svg',
      });

      window.setTimeout(() => {
        note.close();
      }, 4500);
    },
    [notificationPermission]
  );

  useEffect(() => {
    if (!socket || !user) return;

    const handleMessageNotification = (message) => {
      if (!message) return;
      if (String(message.senderId) === String(user.id)) return;

      const isGeneralMessage = message.type === 'general' || !message.recipientId;
      if (isGeneralMessage && activeChat === 'general' && !document.hidden) {
        return;
      }

      if (!isGeneralMessage && String(message.senderId) === String(activeChat) && !document.hidden) {
        return;
      }

      const senderLabel = message.senderUsername || 'New message';
      const scopeLabel = isGeneralMessage ? 'General Channel' : 'Direct message';
      triggerBrowserNotification(senderLabel, `${scopeLabel}: ${message.content || 'Sent a new message'}`);
    };

    const handleIncomingCallNotification = (payload) => {
      if (!payload) return;
      if (String(payload.fromUserId) === String(user.id)) return;

      const modeLabel = payload.callMode === 'audio' ? 'Audio' : 'Video';
      const callerName = payload.fromUsername || 'Someone';
      const scopeLabel =
        typeof payload.callId === 'string' && payload.callId.startsWith('group-')
          ? 'group call'
          : 'call';

      triggerBrowserNotification(`${modeLabel} ${scopeLabel}`, `${callerName} is calling you`);
    };

    socket.on('newMessage', handleMessageNotification);
    socket.on('call:offer', handleIncomingCallNotification);

    return () => {
      socket.off('newMessage', handleMessageNotification);
      socket.off('call:offer', handleIncomingCallNotification);
    };
  }, [activeChat, socket, triggerBrowserNotification, user]);

  useEffect(() => {
    if (activeChat !== 'general') return;
    setGeneralUnread(0);
  }, [activeChat]);

  useEffect(() => {
    if (activeChat === 'general') return;

    setUnreadCounts((prev) => {
      if (!prev[activeChat]) return prev;
      const updated = { ...prev };
      delete updated[activeChat];
      return updated;
    });
  }, [activeChat]);

  useEffect(() => {
    if (!socket || !user || activeChat === 'general') return;

    filteredMessages.forEach((message) => {
      if (String(message.senderId) === String(user.id)) return;
      if (!message.msgId || message.read) return;

      if (!readMessageIdsRef.current.has(message.msgId)) {
        socket.emit('message:read', { msgId: message.msgId });
        readMessageIdsRef.current.add(message.msgId);
      }
    });
  }, [socket, user, activeChat, filteredMessages]);

  const emitTyping = (typing) => {
    if (!socket || !user) return;

    socket.emit('typing', {
      isTyping: typing,
      chatType: activeChat === 'general' ? 'general' : 'direct',
      chatId: activeChat === 'general' ? null : activeChat,
    });
  };

  const stopTyping = () => {
    setIsTyping(false);
    emitTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleTyping = (event) => {
    setMessageInput(event.target.value);

    if (!isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) return;

    const messageData = {
      content: messageInput,
      type: activeChat === 'general' ? 'general' : 'direct',
      recipientId: activeChat === 'general' ? null : activeChat,
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            content: replyToMessage.content,
            senderUsername: replyToMessage.senderUsername,
          }
        : null,
    };

    try {
      await sendMessage(messageData);
      setMessageInput('');
      setReplyToMessage(null);
      setShowEmojiPicker(false);
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getMessageKey = (message, index) => {
    return String(message.msgId || message.id || `local-${index}`);
  };

  const handleToggleReaction = (messageKey, emoji) => {
    const userId = String(user?.id || 'me');

    setMessageReactions((prev) => {
      const existing = prev[messageKey] || {};
      const currentUsers = Array.isArray(existing[emoji]) ? existing[emoji] : [];
      const hasReacted = currentUsers.includes(userId);
      const nextUsers = hasReacted
        ? currentUsers.filter((id) => id !== userId)
        : [...currentUsers, userId];

      const nextEntry = { ...existing };
      if (nextUsers.length === 0) {
        delete nextEntry[emoji];
      } else {
        nextEntry[emoji] = nextUsers;
      }

      return {
        ...prev,
        [messageKey]: nextEntry,
      };
    });

    setActiveReactionTarget(null);
  };

  const handleSelectGeneral = () => {
    setActiveChat('general');
    setGeneralUnread(0);
  };

  const handleSelectMember = (memberId) => {
    const normalizedId = String(memberId);
    setActiveChat(normalizedId);

    setUnreadCounts((prev) => {
      if (!prev[normalizedId]) return prev;
      const updated = { ...prev };
      delete updated[normalizedId];
      return updated;
    });
  };

  const handleVideoCall = () => {
    if (!activeDirectUser) return;

    startCall({
      id: String(activeDirectUser.id),
      username: activeDirectUser.username,
    }, 'video');
  };

  const handleAudioCall = () => {
    if (!activeDirectUser) return;

    startAudioCall({
      id: String(activeDirectUser.id),
      username: activeDirectUser.username,
    });
  };

  const handleGroupVideoCall = () => {
    startGroupCall({
      targets: groupCallTargets,
      mode: 'video',
    });
  };

  const handleGroupAudioCall = () => {
    startGroupCall({
      targets: groupCallTargets,
      mode: 'audio',
    });
  };

  const formatMessageTime = (timestamp) => {
    const fallback = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!timestamp) return fallback;

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatThreadTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const getActiveUserInfo = () => {
    if (activeChat === 'general') {
      const onlineCount = (onlineUsers || []).length;
      return {
        name: 'General Channel',
        status: onlineCount > 0 ? `${onlineCount} online` : 'No users online',
      };
    }

    if (activeDirectUser) {
      return {
        name: activeDirectUser.username,
        status: activeDirectUser.online ? 'Online' : 'Offline',
      };
    }

    return {
      name: 'User',
      status: 'Offline',
    };
  };

  const getMessageStatusMeta = (message, isOwnMessage) => {
    if (!isOwnMessage || message.type !== 'direct') return null;

    if (message.read) {
      return {
        icon: 'bi-check2-all echo-status-read',
        label: 'Read',
      };
    }

    if (message.delivered) {
      return {
        icon: 'bi-check2-all echo-status-delivered',
        label: 'Delivered',
      };
    }

    return {
      icon: 'bi-check2 echo-status-sent',
      label: 'Sent',
    };
  };

  const activeUserInfo = getActiveUserInfo();
  const profileInitial = (user?.username || user?.name || 'U').charAt(0).toUpperCase();
  const isGeneralThread = activeChat === 'general';
  const canCall = activeChat !== 'general' && Boolean(activeDirectUser);
  const canStartCall = canCall && Boolean(activeDirectUser?.online) && callState === 'idle';
  const canStartGroupCall = isGeneralThread && groupCallTargets.length > 0 && callState === 'idle';
  const canStartAudioCall = isGeneralThread ? canStartGroupCall : canStartCall;
  const canStartVideoCall = isGeneralThread ? canStartGroupCall : canStartCall;
  const audioCallTitle = isGeneralThread ? 'Start group audio call' : 'Start audio call';
  const videoCallTitle = isGeneralThread ? 'Start group video call' : 'Start video call';
  const totalUnread = unreadDirectTotal + generalUnread;
  const typingLabel =
    typingUsers.length > 0
      ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
      : '';

  return (
    <>
      <div className="echo-chat-shell">
        <aside className="echo-chat-rail">
          <div className="echo-chat-rail-top">
            <Link to="/" className="echo-chat-rail-logo" title="Echo">
              E
            </Link>
          </div>

          <div className="echo-chat-rail-middle" />

          <div className="echo-chat-rail-bottom">
            <Link to="/profile" className="echo-chat-rail-profile" title="Profile">
              {profileInitial}
            </Link>
            <button
              type="button"
              className="echo-logout-btn"
              onClick={logout}
              title="Logout"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17l5-5-5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </aside>

        <section className="echo-chat-sidebar">
          <div className="echo-chat-sidebar-header">
            <div>
              <h2>Chats</h2>
              <p>{isConnected ? 'Connected live' : 'Connecting...'}</p>
            </div>
            <span className={`echo-connection-dot ${isConnected ? 'online' : 'offline'}`} />
          </div>

          <div className="echo-chat-search-wrap">
            🔍
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>

          <div className="echo-chat-filter-row">
            {chatFilters.map((filter) => {
              let count = 0;
              if (filter.id === 'unread') {
                count = totalUnread;
              }
              if (filter.id === 'online') {
                count = directUsers.filter((entry) => entry.online).length;
              }

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`echo-chat-filter-chip ${chatFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setChatFilter(filter.id)}
                >
                  {filter.label}
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`echo-thread-card ${activeChat === 'general' ? 'active' : ''}`}
            onClick={handleSelectGeneral}
          >
            <div className="echo-thread-avatar echo-thread-avatar-general">#</div>
            <div className="echo-thread-main">
              <div className="echo-thread-head">
                <span className="echo-thread-name">General Channel</span>
                <span className="echo-thread-time">
                  {formatThreadTime(generalThreadMeta?.createdAt || generalThreadMeta?.timestamp)}
                </span>
              </div>
              <p className="echo-thread-preview">
                {generalThreadMeta
                  ? `${generalThreadMeta.senderUsername || 'Member'}: ${generalThreadMeta.content}`
                  : 'Team updates and group discussions'}
              </p>
            </div>
                {generalUnread > 0 && <span className="echo-thread-badge">{generalUnread}</span>}
              </button>

              <div className="echo-thread-list">
                {loadingUsers && <div className="echo-thread-placeholder">Loading users...</div>}

                {!loadingUsers && filteredDirectUsers.length === 0 && (
                  <div className="echo-thread-placeholder">
                    {userSearch
                      ? 'No users found for your search'
                      : 'No direct conversations available yet'}
                  </div>
                )}

                {filteredDirectUsers.map((member) => {
                  const memberId = String(member.id);
                  const thread = directThreadMeta[memberId];
                  const unreadCount = unreadCounts[memberId] || 0;
                  const isActive = String(activeChat) === memberId;
                  const preview = thread
                    ? `${thread.fromMe ? 'You: ' : ''}${thread.content}`
                    : 'Start a conversation';

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`echo-thread-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectMember(member.id)}
                    >
                      <div className="echo-thread-avatar">
                        {(member.username || 'U').charAt(0).toUpperCase()}
                        <span className={`echo-presence-dot ${member.online ? 'online' : 'offline'}`}></span>
                      </div>

                      <div className="echo-thread-main">
                        <div className="echo-thread-head">
                          <span className="echo-thread-name">{member.username}</span>
                          <span className="echo-thread-time">{formatThreadTime(thread?.ts)}</span>
                        </div>
                        <p className="echo-thread-preview">{preview}</p>
                      </div>

                      {unreadCount > 0 && <span className="echo-thread-badge">{unreadCount}</span>}
                    </button>
                  );
                })}
              </div>
        </section>

        {/* Main Chat Area */}
        <section className="echo-chat-main">
          <header className="echo-chat-main-header">
            <div className="echo-chat-user-block">
              <div className="echo-chat-user-avatar">
                {activeChat === 'general' ? '#' : activeUserInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h5>{activeUserInfo.name}</h5>
                <small>{activeUserInfo.status}</small>
              </div>
            </div>

            <div className="echo-chat-main-actions">
              <div className="echo-chat-search-wrap compact">
                🔍
                <input
                  type="text"
                  placeholder="Search messages"
                  value={messageSearch}
                  onChange={(event) => setMessageSearch(event.target.value)}
                />
              </div>
              <div className="echo-chat-call-actions">
                <button
                  type="button"
                  className="echo-main-icon-btn"
                  onClick={() => (isGeneralThread ? handleGroupAudioCall() : handleAudioCall())}
                  disabled={!canStartAudioCall}
                  title={canStartAudioCall ? audioCallTitle : `${audioCallTitle} (unavailable)`}
                  aria-label={audioCallTitle}
                >
                  <i className="bi bi-telephone-fill"></i>
                </button>
                <button
                  type="button"
                  className="echo-main-icon-btn"
                  onClick={() => (isGeneralThread ? handleGroupVideoCall() : handleVideoCall())}
                  disabled={!canStartVideoCall}
                  title={canStartVideoCall ? videoCallTitle : `${videoCallTitle} (unavailable)`}
                  aria-label={videoCallTitle}
                >
                  <i className="bi bi-camera-video-fill"></i>
                </button>
              </div>
            </div>
          </header>

          <div className="echo-chat-board">
            <div className="echo-chat-watermark"></div>

            <div className="echo-chat-messages chat-messages-scroll">
              {visibleMessages.map((message, index) => {
                const messageKey = getMessageKey(message, index);
                const isOwnMessage = String(message.senderId) === String(user?.id);
                const senderName = message.senderUsername || 'Unknown';
                const statusMeta = getMessageStatusMeta(message, isOwnMessage);
                const displayContent =
                  typeof message.content === 'string' && message.content.startsWith('gif:')
                    ? message.content.slice(4).trim()
                    : message.content;
                const reactionMap = messageReactions[messageKey] || {};
                const reactionEntries = Object.entries(reactionMap).filter(([, users]) =>
                  Array.isArray(users) && users.length > 0
                );

                return (
                  <div
                    key={message.id || message.msgId || index}
                    className={`echo-message-row ${isOwnMessage ? 'mine' : 'theirs'}`}
                  >
                    {!isOwnMessage && <div className="echo-message-sender">{senderName}</div>}

                    {message.replyTo && (
                      <div className="echo-reply-chip">
                        <span>{message.replyTo.senderUsername}</span>
                        <p>{message.replyTo.content}</p>
                      </div>
                    )}

                    <div className={`echo-message-bubble ${isOwnMessage ? 'mine' : 'theirs'}`}>
                      <p className="echo-message-text">{displayContent}</p>
                      <div className="echo-message-meta">
                        <span>{formatMessageTime(message.createdAt || message.timestamp)}</span>
                        {statusMeta && (
                          <span title={statusMeta.label}>
                            <i className={`bi ${statusMeta.icon}`}></i>
                          </span>
                        )}
                      </div>
                    </div>

                    {reactionEntries.length > 0 && (
                      <div className={`echo-reaction-row ${isOwnMessage ? 'mine' : 'theirs'}`}>
                        {reactionEntries.map(([emoji, users]) => (
                          <button
                            key={`${messageKey}-${emoji}`}
                            type="button"
                            className="echo-reaction-chip"
                            onClick={() => handleToggleReaction(messageKey, emoji)}
                            title="Toggle reaction"
                          >
                            <span>{emoji}</span>
                            <span>{users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="echo-message-actions">
                      <button
                        type="button"
                        className="echo-react-btn"
                        onClick={() =>
                          setActiveReactionTarget(
                            activeReactionTarget === messageKey ? null : messageKey
                          )
                        }
                        title="React"
                      >
                        <i className="bi bi-emoji-smile"></i>
                      </button>
                      <button
                        type="button"
                        className="echo-reply-btn"
                        onClick={() => setReplyToMessage(message)}
                        title="Reply"
                      >
                        <i className="bi bi-reply"></i>
                      </button>
                    </div>

                    {activeReactionTarget === messageKey && (
                      <div
                        className={`echo-reaction-picker ${isOwnMessage ? 'mine' : 'theirs'}`}
                      >
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={`${messageKey}-picker-${emoji}`}
                            type="button"
                            className="echo-reaction-emoji"
                            onClick={() => handleToggleReaction(messageKey, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {visibleMessages.length === 0 && (
                <div className="echo-empty-thread">
                  {messageSearch
                    ? 'No messages match your search.'
                    : 'No messages yet. Start the conversation.'}
                </div>
              )}

              {typingLabel && <div className="echo-typing-line">{typingLabel}</div>}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="echo-composer-wrap">
            {replyToMessage && (
              <div className="echo-reply-preview">
                <div>
                  <div className="echo-reply-meta">
                    Replying to {replyToMessage.senderUsername || 'User'}
                  </div>
                  <div className="echo-reply-content">{replyToMessage.content}</div>
                </div>
                <button
                  type="button"
                  className="echo-reply-close"
                  onClick={() => setReplyToMessage(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            )}

            {showEmojiPicker && (
              <div className="echo-emoji-grid">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="echo-emoji-btn"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="echo-composer-form">
              <div className="echo-composer-actions">
                <button
                  type="button"
                  className="echo-main-icon-btn"
                  onClick={() => {
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  title="Add emoji"
                >
                  <i className="bi bi-emoji-smile"></i>
                </button>
              </div>

              <input
                type="text"
                className="echo-composer-input"
                placeholder={
                  replyToMessage
                    ? `Reply to ${replyToMessage.senderUsername || 'User'}...`
                    : `Message ${activeChat === 'general' ? 'General Channel' : activeUserInfo.name}...`
                }
                value={messageInput}
                onChange={handleTyping}
                disabled={!isConnected}
              />

              <button
                type="submit"
                className="echo-send-btn"
                disabled={!messageInput.trim() || !isConnected}
                title="Send message"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </section>
      </div>

      <VideoCallModal
        isOpen={callState !== 'idle'}
        callState={callState}
        activeCallUser={activeCallUser}
        incomingCall={incomingCall}
        callMode={callMode}
        callScope={callScope}
        remoteParticipants={remoteParticipants}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        callError={callError}
        onAccept={acceptIncomingCall}
        onReject={rejectIncomingCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onClearError={clearCallError}
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        allUsers={directUsers || []}
        currentUser={user}
        onCreateGroup={async (groupData) => {
          try {
            // For now, we'll create a system message indicating a group was created
            // In a real app, you'd save groups to the database
            const groupMessage = {
              content: `Group "${groupData.name}" created with members: ${groupData.members.join(', ')}`,
              type: 'system',
              isGroupCreation: true,
              groupName: groupData.name,
              groupMembers: groupData.members,
            };
            
            await sendMessage(groupMessage);
            setShowCreateGroupModal(false);
            alert(`Group "${groupData.name}" created successfully!`);
          } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
          }
        }}
      />
    </>
  );
};

export default Chat;
