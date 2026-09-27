import React, { useState } from 'react';
import { 
  UsersIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const OnlineUsers = ({ 
  users, 
  currentUser, 
  onUserSelect, 
  onStartChat,
  typingUsers = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, online, typing

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(user => 
      user.id !== currentUser?.id && // Exclude current user
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (selectedFilter) {
      case 'online':
        filtered = filtered.filter(user => user.isOnline);
        break;
      case 'typing':
        filtered = filtered.filter(user => 
          typingUsers.some(typingUser => typingUser.id === user.id)
        );
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      // Sort by online status first, then by username
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      return a.username.localeCompare(b.username);
    });
  };

  const getUserStatus = (user) => {
    if (typingUsers.some(typingUser => typingUser.id === user.id)) {
      return { text: 'Typing...', color: 'text-blue-400', dot: 'bg-blue-400' };
    }
    
    if (user.isOnline) {
      return { text: 'Online', color: 'text-green-400', dot: 'bg-green-400' };
    }
    
    if (user.lastSeen) {
      const lastSeenDate = new Date(user.lastSeen);
      const now = new Date();
      const diffInHours = Math.floor((now - lastSeenDate) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return { text: 'Last seen recently', color: 'text-yellow-400', dot: 'bg-yellow-400' };
      } else if (diffInHours < 24) {
        return { text: `Last seen ${diffInHours}h ago`, color: 'text-gray-400', dot: 'bg-gray-400' };
      } else {
        return { text: format(lastSeenDate, 'MMM dd'), color: 'text-gray-500', dot: 'bg-gray-500' };
      }
    }
    
    return { text: 'Offline', color: 'text-gray-500', dot: 'bg-gray-500' };
  };

  const filteredUsers = getFilteredUsers();
  const onlineCount = users.filter(user => user.isOnline && user.id !== currentUser?.id).length;
  const typingCount = typingUsers.length;

  return (
    <div className="flex flex-col h-full bg-chat-background">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Online Users</h2>
            <p className="text-gray-400 text-sm">
              {onlineCount} user{onlineCount !== 1 ? 's' : ''} online
            </p>
          </div>
          <div className="bg-blue-600 text-white rounded-full p-2">
            <UsersIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-3">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            All ({filteredUsers.length})
          </button>
          <button
            onClick={() => setSelectedFilter('online')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedFilter === 'online'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Online ({onlineCount})
          </button>
          {typingCount > 0 && (
            <button
              onClick={() => setSelectedFilter('typing')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'typing'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Typing ({typingCount})
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <UserIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
              <h3 className="text-gray-400 font-medium mb-1">No users found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No users match the current filter'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredUsers.map((user) => {
              const status = getUserStatus(user);
              const isTyping = typingUsers.some(typingUser => typingUser.id === user.id);

              return (
                <div
                  key={user.id}
                  className="bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition-colors cursor-pointer group"
                  onClick={() => onUserSelect?.(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          user.isOnline 
                            ? 'bg-gradient-to-br from-green-400 to-blue-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {getInitials(user.username)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${status.dot} rounded-full border-2 border-gray-800`}></div>
                        {isTyping && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium truncate">
                            {user.username}
                          </h3>
                          {user.isVerified && (
                            <div className="bg-blue-500 text-white rounded-full p-0.5">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs ${status.color} truncate`}>
                          {isTyping ? (
                            <span className="flex items-center">
                              <span className="typing-dots mr-2">
                                <span></span>
                                <span></span>
                                <span></span>
                              </span>
                              {status.text}
                            </span>
                          ) : (
                            status.text
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartChat?.(user);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                      title={`Start chat with ${user.username}`}
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* User Details (expandable) */}
                  {user.bio && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-gray-400 text-xs">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>{onlineCount} online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <span>{users.length - onlineCount - 1} offline</span>
            </div>
          </div>
          {typingCount > 0 && (
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>{typingCount} typing</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;