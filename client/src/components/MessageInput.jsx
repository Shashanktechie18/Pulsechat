import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon,
  PaperClipIcon,
  GifIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  disabled = false,
  placeholder = "Aa" 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Extended emoji collection with categories
  const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😚', '😙', '😗', '😚'],
    gestures: ['👍', '👎', '👋', '🤝', '👏', '🙌', '👐', '🤲', '😻', '😸', '😹', '😻'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💞', '💓'],
    objects: ['🎉', '🎊', '🎈', '🎁', '🔥', '💯', '⭐', '✨', '🌟', '💫', '🚀', '😎'],
    hand: ['👊', '✊', '🤛', '🤜', '👊', '✌️', '🤞', '🤟', '🤘', '🤙', '👌', '🤌']
  };

  // Popular GIFs (in real app, would fetch from GIPHY API)
  const popularGifs = [
    '👍😂❤️🔥',
    '😍🎉😭🙌',
    '👏😎🚀💪',
    '🤔😱😍😂'
  ];

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      setIsTyping(false);
      onTyping?.(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
    }, 0);
  };

  const handleGifSelect = (gif) => {
    onSendMessage(gif);
    setMessage('');
    setShowGifPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      console.log('Files selected:', files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-gray-700 bg-chat-input">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Emojis</h3>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
            {Object.values(emojiCategories).flat().map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl hover:scale-125 hover:bg-gray-700 rounded p-2 transition-all duration-200"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Quick GIFs</h3>
            <button
              onClick={() => setShowGifPicker(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {popularGifs.map((gif, index) => (
              <button
                key={index}
                onClick={() => handleGifSelect(gif)}
                className="text-base font-semibold text-center p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {gif}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={openFileDialog}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Photo Upload Button */}
          <button
            type="button"
            onClick={openFileDialog}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send photo"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>

          {/* GIF Button */}
          <button
            type="button"
            onClick={() => setShowGifPicker(!showGifPicker)}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send GIF"
          >
            <GifIcon className="h-5 w-5" />
          </button>

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-gray-700 rounded-3xl overflow-hidden border border-gray-600 focus-within:border-blue-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 resize-none outline-none disabled:cursor-not-allowed"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifPicker(false);
                }}
                disabled={disabled}
                className="flex-shrink-0 p-3 text-gray-400 hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add emoji"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600 shadow-lg hover:shadow-xl"
            title="Send message (Enter)"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
          </button>
        </div>

        {/* Character count and tips */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>↵ to send, Shift+↵ for new line</span>
          </div>
          <div className="flex items-center space-x-2">
            {message.length > 0 && (
              <span className={message.length > 1000 ? 'text-red-400' : ''}>
                {message.length}/1000
              </span>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};

export default MessageInput;