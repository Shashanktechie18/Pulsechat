import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';

const MessageList = ({ messages, currentUser, onlineUsers, typingUsers }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const shouldShowTimestamp = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    
    const currentTime = new Date(currentMsg.timestamp);
    const previousTime = new Date(previousMsg.timestamp);
    
    return differenceInMinutes(currentTime, previousTime) >= 5;
  };

  const shouldShowAvatar = (currentMsg, nextMsg) => {
    if (!nextMsg) return true;
    
    return currentMsg.senderId !== nextMsg.senderId;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getUserById = (id) => {
    return onlineUsers.find(user => user.id === id) || { username: 'Unknown User' };
  };

  const renderTypingIndicators = () => {
    if (typingUsers.length === 0) return null;

    return (
      <div className="flex items-center space-x-3 px-4 py-2">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-gray-400 text-sm italic">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} users are typing...`
            }
          </p>
        </div>
      </div>
    );
  };

  const renderDateSeparator = (date) => {
    let dateText;
    
    if (isToday(new Date(date))) {
      dateText = 'Today';
    } else if (isYesterday(new Date(date))) {
      dateText = 'Yesterday';
    } else {
      dateText = format(new Date(date), 'MMMM dd, yyyy');
    }

    return (
      <div className="flex items-center justify-center py-4">
        <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
          {dateText}
        </div>
      </div>
    );
  };

  const renderMessage = (message, index) => {
    const isCurrentUser = message.senderId === currentUser?.id;
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const showTimestamp = shouldShowTimestamp(message, previousMessage);
    const showAvatar = shouldShowAvatar(message, nextMessage);
    const user = getUserById(message.senderId);
    
    const messageDate = format(new Date(message.timestamp), 'yyyy-MM-dd');
    const previousMessageDate = previousMessage 
      ? format(new Date(previousMessage.timestamp), 'yyyy-MM-dd')
      : null;

    return (
      <React.Fragment key={message.id}>
        {/* Date separator */}
        {messageDate !== previousMessageDate && renderDateSeparator(message.timestamp)}
        
        {/* Timestamp separator */}
        {showTimestamp && (
          <div className="flex items-center justify-center py-2">
            <div className="text-gray-500 text-xs">
              {formatMessageTime(message.timestamp)}
            </div>
          </div>
        )}

        {/* Message */}
        <div className={`flex items-end space-x-3 px-4 py-1 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}>
          {/* Avatar (left side for others) */}
          {!isCurrentUser && (
            <div className="flex-shrink-0">
              {showAvatar ? (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(user.username)}
                </div>
              ) : (
                <div className="h-8 w-8"></div>
              )}
            </div>
          )}

          {/* Message content */}
          <div className={`flex flex-col max-w-xs lg:max-w-md xl:max-w-lg ${
            isCurrentUser ? 'items-end' : 'items-start'
          }`}>
            {/* Username (for others) */}
            {!isCurrentUser && showAvatar && (
              <p className="text-gray-400 text-xs mb-1 px-3">
                {user.username}
              </p>
            )}

            {/* Message bubble */}
            <div
              className={`relative px-4 py-2 rounded-2xl max-w-full break-words ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                  : 'bg-gray-700 text-white rounded-bl-md'
              } ${showAvatar ? '' : 'mt-1'}`}
            >
              <p className="whitespace-pre-wrap break-words text-justify" style={{wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto'}}>{message.text}</p>
              
              {/* Message status */}
              {isCurrentUser && (
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-blue-200 text-xs opacity-75">
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {message.status === 'sending' && (
                    <div className="h-3 w-3 border border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {message.status === 'sent' && (
                    <svg className="h-3 w-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {message.status === 'delivered' && (
                    <div className="flex space-x-0.5">
                      <svg className="h-3 w-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className="h-3 w-3 text-blue-200 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {message.status === 'read' && (
                    <div className="flex space-x-0.5">
                      <svg className="h-3 w-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className="h-3 w-3 text-green-300 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar (right side for current user) */}
          {isCurrentUser && (
            <div className="flex-shrink-0">
              {showAvatar ? (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(currentUser.username)}
                </div>
              ) : (
                <div className="h-8 w-8"></div>
              )}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-gray-400">Start a conversation by sending a message below!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar py-4"
    >
      <div className="space-y-1">
        {messages.map((message, index) => renderMessage(message, index))}
        {renderTypingIndicators()}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;