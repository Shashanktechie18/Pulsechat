import React, { useState, useEffect } from 'react';

const CreateGroupModal = ({ 
  isOpen, 
  onClose, 
  allUsers = [],
  currentUser,
  onCreateGroup 
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [localUsers, setLocalUsers] = useState([]);

  useEffect(() => {
    setLocalUsers(Array.isArray(allUsers) ? allUsers : []);
  }, [allUsers, isOpen]);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateGroup({
        name: groupName.trim(),
        members: selectedUsers,
        createdBy: currentUser?.id
      });

      setGroupName('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = localUsers.filter(user => String(user.id) !== String(currentUser?.id));
  const onlineCount = selectedUsers.filter(userId => 
    localUsers.find(u => String(u.id) === userId)?.online
  ).length;
  const offlineCount = selectedUsers.length - onlineCount;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .group-modal-users-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .group-modal-users-scroll::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        .group-modal-users-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        .group-modal-users-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.8);
        }
      `}</style>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 1px 0 rgba(59, 130, 246, 0.3)',
        width: '95%',
        maxWidth: '480px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
          padding: '28px 24px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              👥
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
                Create Group
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>
                Bring people together
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              transition: 'all 0.2s',
              fontSize: '20px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#cbd5e1';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
        className="group-modal-users-scroll">
          {/* Group Name Input */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#e2e8f0',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Project Team, Friends..."
              style={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1.5px solid rgba(59, 130, 246, 0.3)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
              }}
            />
          </div>

          {/* Members Selection */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#e2e8f0',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                👤
              </span>
              Select Members ({selectedUsers.length}){selectedUsers.length > 0 && ` - ${onlineCount} online, ${offlineCount} offline`}
            </label>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              maxHeight: '280px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
            className="group-modal-users-scroll">
              {filteredUsers.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#9ca3af', 
                  padding: '40px 20px',
                  borderRadius: '12px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px dashed rgba(100, 116, 139, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>😴</div>
                  <p>No users available</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(String(user.id));
                  const isOnline = user.online === true;
                  return (
                    <button
                      key={String(user.id)}
                      onClick={() => toggleUserSelection(String(user.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.4)',
                        border: isSelected ? '1.5px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(100, 116, 139, 0.2)',
                        textAlign: 'left',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)'
                          : 'rgba(30, 41, 59, 0.4)',
                        boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.4)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.4)';
                          e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                        }
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: isSelected 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        flexShrink: 0,
                        boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                      }}>
                        {getInitials(user.username)}
                      </div>
                      
                      {/* User info */}
                      <div style={{ marginLeft: '14px', flex: 1 }}>
                        <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0 0 2px 0', fontSize: '0.95rem' }}>
                          {user.username}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: isOnline ? '#10b981' : '#ef4444', margin: 0 }}>
                          {isOnline ? '● Online' : '○ Offline'}
                        </p>
                      </div>
                      
                      {/* Checkbox */}
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: isSelected ? '#3b82f6' : '#9ca3af',
                        backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}>
                        {isSelected && (
                          <svg style={{ width: '14px', height: '14px', color: '#ffffff' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '20px 24px',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              color: '#cbd5e1',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
              e.target.style.borderColor = 'rgba(100, 116, 139, 0.5)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
              e.target.style.color = '#cbd5e1';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: !groupName.trim() || selectedUsers.length === 0 || isCreating 
                ? '#4b5563' 
                : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: !groupName.trim() || selectedUsers.length === 0 || isCreating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              opacity: !groupName.trim() || selectedUsers.length === 0 || isCreating ? 0.6 : 1,
              boxShadow: !groupName.trim() || selectedUsers.length === 0 || isCreating 
                ? 'none'
                : '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!(!groupName.trim() || selectedUsers.length === 0 || isCreating)) {
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!groupName.trim() || selectedUsers.length === 0 || isCreating)) {
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
