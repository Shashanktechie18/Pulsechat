import React, { useState } from 'react';
import { 
  UserIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCamera as VideoCameraIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon,
  StarIcon 
} from '@heroicons/react/24/solid';
import { format, formatDistanceToNow } from 'date-fns';

const UserProfile = ({ 
  user, 
  currentUser,
  onClose,
  onStartChat,
  onStartCall,
  onStartVideo,
  isOnline = false,
  mutualFriends = [],
  commonInterests = [],
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('about');
  const [showFullBio, setShowFullBio] = useState(false);

  if (!user) {
    return null;
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getStatusInfo = () => {
    if (isOnline) {
      return { text: 'Online', color: 'text-green-400', dot: 'bg-green-400' };
    }
    
    if (user.lastSeen) {
      const lastSeenDate = new Date(user.lastSeen);
      const distance = formatDistanceToNow(lastSeenDate, { addSuffix: true });
      return { 
        text: `Last seen ${distance}`, 
        color: 'text-gray-400', 
        dot: 'bg-gray-400' 
      };
    }
    
    return { text: 'Offline', color: 'text-gray-500', dot: 'bg-gray-500' };
  };

  const status = getStatusInfo();
  const isCurrentUser = user.id === currentUser?.id;

  const tabs = [
    { id: 'about', name: 'About', icon: UserIcon },
    { id: 'media', name: 'Media', icon: LinkIcon },
    { id: 'friends', name: 'Friends', icon: UserIcon }
  ];

  const renderAboutTab = () => (
    <div className="space-y-6">
      {/* Bio */}
      {user.bio && (
        <div>
          <h4 className="text-white font-medium mb-2">Bio</h4>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {showFullBio || user.bio.length <= 150 
                ? user.bio 
                : `${user.bio.substring(0, 150)}...`
              }
            </p>
            {user.bio.length > 150 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-blue-400 text-sm mt-2 hover:text-blue-300"
              >
                {showFullBio ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div>
        <h4 className="text-white font-medium mb-3">Details</h4>
        <div className="space-y-3">
          {user.location && (
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">{user.location}</span>
            </div>
          )}
          
          {user.joinedAt && (
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">
                Joined {format(new Date(user.joinedAt), 'MMMM yyyy')}
              </span>
            </div>
          )}

          {user.timezone && (
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">{user.timezone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h4 className="text-white font-medium mb-3">Activity</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {user.messageCount || 0}
            </div>
            <div className="text-xs text-gray-400">Messages</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {mutualFriends.length}
            </div>
            <div className="text-xs text-gray-400">Mutual</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {user.rating || 0}
            </div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
        </div>
      </div>

      {/* Interests */}
      {commonInterests.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">Common Interests</h4>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map((interest, index) => (
              <span
                key={index}
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <LinkIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
        <h3 className="text-white font-medium mb-1">No shared media</h3>
        <p className="text-gray-400 text-sm">
          Media files will appear here when you start chatting
        </p>
      </div>
    </div>
  );

  const renderFriendsTab = () => (
    <div className="space-y-4">
      {mutualFriends.length > 0 ? (
        <div>
          <h4 className="text-white font-medium mb-3">
            Mutual Friends ({mutualFriends.length})
          </h4>
          <div className="space-y-2">
            {mutualFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(friend.username)}
                </div>
                <span className="text-white">{friend.username}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <UserIcon className="h-12 w-12 mx-auto text-gray-600 mb-2" />
          <h3 className="text-white font-medium mb-1">No mutual friends</h3>
          <p className="text-gray-400 text-sm">
            You don't have any mutual friends yet
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-chat-background border-l border-gray-700 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-medium mx-auto">
                {getInitials(user.username)}
              </div>
              <div className={`absolute bottom-1 right-1 h-5 w-5 ${status.dot} rounded-full border-2 border-gray-800`}></div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-1">
              {user.username}
              {user.isVerified && (
                <StarIcon className="h-4 w-4 text-yellow-400 ml-1 inline" />
              )}
            </h3>
            
            <p className={`text-sm ${status.color} mb-4`}>
              {status.text}
            </p>

            {/* Action Buttons */}
            {!isCurrentUser && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => onStartChat?.(user)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Message</span>
                </button>
                
                <button
                  onClick={() => onStartCall?.(user)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => onStartVideo?.(user)}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                >
                  <VideoCameraIcon className="h-4 w-4" />
                </button>
                
                <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'friends' && renderFriendsTab()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;