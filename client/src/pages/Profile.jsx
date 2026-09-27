import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      setSaveStatus('Username cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: username.trim(),
          profilePic: profilePicUrl.trim()
        })
      });

      if (response.ok) {
        setSaveStatus('✓ Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => {
          setSaveStatus(null);
          window.location.reload();
        }, 1500);
      } else {
        setSaveStatus('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setSaveStatus('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setProfilePicUrl(user?.profilePic || '');
    setIsEditing(false);
    setSaveStatus(null);
  };

  const getProfileImage = () => {
    if (profilePicUrl && profilePicUrl.startsWith('http')) {
      return <img src={profilePicUrl} alt="Profile" style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}} />;
    }
    return (
      <div className="mx-auto bg-primary rounded-circle d-flex align-items-center justify-content-center" 
           style={{width: '100px', height: '100px'}}>
        <i className="bi bi-person-fill text-white" style={{fontSize: '3rem'}}></i>
      </div>
    );
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(56,189,248,0.05))'}}>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg" style={{background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(148,163,184,0.16)'}}>
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center" style={{textDecoration: 'none'}}>
            <div className="d-flex align-items-center justify-content-center me-3 fw-bold" 
                 style={{width: '40px', height: '40px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #25d366, #34b7f1)', borderRadius: '50%', color: 'white'}}>
              E
            </div>
            <span style={{color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700'}}>Echo</span>
          </Link>
          
          <div className="d-flex align-items-center gap-2">
            <Link to="/chat" className="btn btn-outline-light btn-sm me-2">
              <i className="bi bi-chat-left-text me-1"></i>
              Back to Chat
            </Link>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Profile Content */}
      <div className="container py-4 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Status Message */}
            {saveStatus && (
              <div className={`alert alert-${saveStatus.includes('successfully') ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                {saveStatus}
                <button type="button" className="btn-close" onClick={() => setSaveStatus(null)}></button>
              </div>
            )}

            {/* Profile Header */}
            <div className="card shadow-lg border-0 mb-4" style={{background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99,102,241,0.2)'}}>
              <div className="card-body text-center p-4 p-md-5">
                <div className="mb-4">
                  {getProfileImage()}
                </div>
                <h2 className="fw-bold mb-2" style={{color: '#f8fafc'}}>{user?.username || 'User'}</h2>
                <p className="mb-3" style={{color: 'rgba(226,232,240,0.68)'}}>{user?.email || 'user@example.com'}</p>
                <span className="badge bg-success px-3 py-2">
                  <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i>
                  Online
                </span>
              </div>
            </div>

            {/* Profile Information / Edit Form */}
            <div className="card shadow-lg border-0" style={{background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99,102,241,0.2)'}}>
              <div className="card-header" style={{background: 'rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.2)'}}>
                <h5 className="mb-0" style={{color: '#f8fafc'}}>
                  <i className="bi bi-person-lines-fill me-2"></i>
                  {isEditing ? 'Edit Profile' : 'Profile Information'}
                </h5>
              </div>
              <div className="card-body">
                {!isEditing ? (
                  <>
                    <div className="row mb-3">
                      <div className="col-sm-4">
                        <strong style={{color: '#f8fafc'}}>Username:</strong>
                      </div>
                      <div className="col-sm-8" style={{color: 'rgba(226,232,240,0.8)'}}>
                        {user?.username || 'Not available'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-4">
                        <strong style={{color: '#f8fafc'}}>Email:</strong>
                      </div>
                      <div className="col-sm-8" style={{color: 'rgba(226,232,240,0.8)'}}>
                        {user?.email || 'Not available'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-4">
                        <strong style={{color: '#f8fafc'}}>Profile Picture:</strong>
                      </div>
                      <div className="col-sm-8" style={{color: 'rgba(226,232,240,0.8)'}}>
                        {user?.profilePic ? `${user.profilePic.substring(0, 50)}...` : 'Not set'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-sm-4">
                        <strong style={{color: '#f8fafc'}}>Member since:</strong>
                      </div>
                      <div className="col-sm-8" style={{color: 'rgba(226,232,240,0.8)'}}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                      </div>
                    </div>
                    
                    <hr style={{borderColor: 'rgba(148,163,184,0.16)'}} />
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn fw-medium"
                        onClick={() => setIsEditing(true)}
                        style={{background: 'linear-gradient(135deg, #6366f1, #38bdf8)', color: 'white', border: 'none'}}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Profile
                      </button>
                      <Link to="/chat" className="btn btn-outline-light">
                        <i className="bi bi-chat-left-text me-2"></i>
                        Back to Chat
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label" style={{color: '#f8fafc'}}>
                        <i className="bi bi-person-fill me-2"></i>
                        Username
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        style={{background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.3)', color: '#f8fafc'}}
                      />
                      <small style={{color: 'rgba(226,232,240,0.6)'}}>Your display name visible to other users</small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label" style={{color: '#f8fafc'}}>
                        <i className="bi bi-image me-2"></i>
                        Profile Picture URL
                      </label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={profilePicUrl}
                        onChange={(e) => setProfilePicUrl(e.target.value)}
                        placeholder="https://example.com/profile-pic.jpg"
                        style={{background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.3)', color: '#f8fafc'}}
                      />
                      <small style={{color: 'rgba(226,232,240,0.6)'}}>Paste a direct image URL (must start with https://)</small>
                    </div>

                    {profilePicUrl && profilePicUrl.startsWith('http') && (
                      <div className="mb-4 text-center">
                        <label style={{color: '#f8fafc'}} className="d-block mb-2">Preview:</label>
                        <img 
                          src={profilePicUrl} 
                          alt="Profile preview" 
                          style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)'}}
                          onError={() => setProfilePicUrl('')}
                        />
                      </div>
                    )}

                    <hr style={{borderColor: 'rgba(148,163,184,0.16)'}} />
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn fw-medium"
                        onClick={handleSaveProfile}
                        disabled={isSaving || !username.trim()}
                        style={{background: 'linear-gradient(135deg, #34d399, #10b981)', color: 'white', border: 'none'}}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        className="btn btn-outline-light"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;