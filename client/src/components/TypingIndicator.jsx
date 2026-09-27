import React from 'react';

const TypingIndicator = ({ 
  typingUsers = [], 
  currentUser,
  className = "" 
}) => {
  // Filter out current user from typing users
  const filteredTypingUsers = typingUsers.filter(
    user => user.id !== currentUser?.id
  );

  if (filteredTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const usernames = filteredTypingUsers.map(user => user.username);
    
    if (usernames.length === 1) {
      return `${usernames[0]} is typing...`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing...`;
    } else if (usernames.length === 3) {
      return `${usernames[0]}, ${usernames[1]} and ${usernames[2]} are typing...`;
    } else {
      return `${usernames[0]}, ${usernames[1]} and ${usernames.length - 2} others are typing...`;
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={`flex items-center space-x-3 px-4 py-3 ${className}`}>
      {/* Avatars */}
      <div className="flex -space-x-2">
        {filteredTypingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ zIndex: 10 - index }}
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-gray-800">
              {getInitials(user.username)}
            </div>
            {/* Typing pulse effect */}
            <div className="absolute inset-0 h-6 w-6 rounded-full bg-blue-500 animate-ping opacity-30"></div>
          </div>
        ))}
      </div>

      {/* Typing text and animation */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-sm italic">
          {getTypingText()}
        </span>
        
        {/* Typing dots animation */}
        <div className="typing-indicator flex space-x-1">
          <div className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Alternative compact version for smaller spaces
export const CompactTypingIndicator = ({ 
  typingUsers = [], 
  currentUser,
  className = "" 
}) => {
  const filteredTypingUsers = typingUsers.filter(
    user => user.id !== currentUser?.id
  );

  if (filteredTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Simple typing dots */}
      <div className="typing-indicator-compact flex space-x-1">
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      <span className="text-blue-400 text-xs">
        {filteredTypingUsers.length} typing
      </span>
    </div>
  );
};

// Bubble version that appears as a message bubble
export const BubbleTypingIndicator = ({ 
  typingUsers = [], 
  currentUser,
  className = "" 
}) => {
  const filteredTypingUsers = typingUsers.filter(
    user => user.id !== currentUser?.id
  );

  if (filteredTypingUsers.length === 0) {
    return null;
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={`flex items-end space-x-3 px-4 py-2 ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
          {filteredTypingUsers.length === 1 ? (
            getInitials(filteredTypingUsers[0].username)
          ) : (
            '...'
          )}
        </div>
      </div>

      {/* Typing bubble */}
      <div className="bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">
            {filteredTypingUsers.length === 1 
              ? `${filteredTypingUsers[0].username} is typing`
              : `${filteredTypingUsers.length} people are typing`
            }
          </span>
          
          {/* Animated dots inside bubble */}
          <div className="typing-indicator-bubble flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;