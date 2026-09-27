import React from 'react';
import { 
  XMarkIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ChatSidebar = ({
  isOpen,
  onClose,
  user,
  onlineUsers,
  activeView,
  setActiveView,
  selectedUser,
  setSelectedUser,
  onLogout,
  onCreateGroup
}) => {
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-96 bg-chat-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const handleUserSelect = (chatUser) => {
    setSelectedUser(chatUser);
    setActiveView('chat');
    onClose();
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    onClose();
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-chat-header">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user?.username)}
            </div>
            <div className="ml-3">
              <h3 className="text-white font-medium">{user?.username}</h3>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
                <span className="text-green-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <nav className="space-y-2">
            <button
              onClick={() => handleViewChange('chat')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
              General Chat
            </button>
            
            <button
              onClick={() => handleViewChange('users')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <UsersIcon className="h-5 w-5 mr-3" />
              Online Users
              {onlineUsers.length > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {onlineUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onCreateGroup?.()}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:text-white hover:bg-green-700 hover:bg-opacity-30"
              title="Create a new group"
            >
              <SparklesIcon className="h-5 w-5 mr-3" />
              Create Group
            </button>

            <button
              onClick={() => handleViewChange('profile')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </button>
          </nav>
        </div>

        {/* Online Users List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 pb-4">
            <h4 className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-3">
              Online Users ({onlineUsers.length})
            </h4>
            <div className="space-y-1">
              {onlineUsers.map((onlineUser) => (
                <button
                  key={onlineUser.id}
                  onClick={() => handleUserSelect(onlineUser)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedUser?.id === onlineUser.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(onlineUser.username)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <p className="font-medium">{onlineUser.username}</p>
                    <p className="text-xs opacity-75">Online</p>
                  </div>
                </button>
              ))}
            </div>

            {onlineUsers.length === 0 && (
              <div className="text-center py-4">
                <UsersIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm">No users online</p>
              </div>
            )}
          </div>
        </div>

       
        <div className="p-4 border-t border-gray-700">
          <div className="space-y-2">
            <button
              onClick={() => handleViewChange('settings')}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-3" />
              Settings
            </button>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-7 w-7 mr-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;