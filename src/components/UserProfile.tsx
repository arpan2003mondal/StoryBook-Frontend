import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { UserProfile } from '../model/UserProfile';
import { Messages } from '../messages/messages';
import { ToastService } from '../services/ToastService';
import '../styles/UserProfile.css';

const UserProfileComponent = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const userData: UserProfile = await UserService.getProfile();
        setProfile(userData);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        const errorMsg = error.response?.data?.message || error.response?.data || Messages.PROFILE_LOAD_FAILED;
        ToastService.showError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatJoinDate = (dateString: string | undefined): string => {
    if (!dateString) return Messages.PROFILE_NO_DATA_VALUE;
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleChangeUsername = () => {
    navigate('/change-username');
  };

  if (isLoading) {
    return (
      <div className="user-profile-container">
        <div className="loading">
          <p>{Messages.PROFILE_LOADING}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile-container">
        <div className="error-state">
          <p className="error-message">{Messages.PROFILE_NO_DATA}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-initial">
              {profile.name?.charAt(0).toUpperCase() || Messages.PROFILE_DEFAULT_AVATAR}
            </span>
          </div>
          <h1 className="profile-title">{Messages.PROFILE_TITLE}</h1>
        </div>

        <div className="profile-content">
          {/* Username Section */}
          <div className="profile-section">
            <div className="section-label">{Messages.PROFILE_USERNAME_LABEL}</div>
            <div className="section-content">
              <div className="username-display">
                <span className="username-value">{profile.name}</span>
                <button
                  className="action-btn change-username-btn"
                  onClick={handleChangeUsername}
                  title={Messages.PROFILE_CHANGE_USERNAME_TITLE}
                >
                  {Messages.CHANGE_USERNAME_BUTTON}
                </button>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="profile-section">
            <div className="section-label">{Messages.PROFILE_EMAIL_LABEL}</div>
            <div className="section-content">
              <span className="section-value">{profile.email}</span>
            </div>
          </div>

          {/* Role Section */}
          {profile.role && (
            <div className="profile-section">
              <div className="section-label">{Messages.PROFILE_ROLE_LABEL}</div>
              <div className="section-content">
                <span className="section-value role-badge">{profile.role}</span>
              </div>
            </div>
          )}

          {/* Join Date Section */}
          <div className="profile-section">
            <div className="section-label">{Messages.PROFILE_MEMBER_SINCE_LABEL}</div>
            <div className="section-content">
              <span className="section-value">
                {Messages.PROFILE_MEMBER_SINCE_TEXT} {formatJoinDate(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="profile-section password-section">
            <div className="section-label">{Messages.PROFILE_SECURITY_LABEL}</div>
            <div className="section-content">
              <button
                className="action-btn change-password-btn"
                onClick={handleChangePassword}
                title={Messages.PROFILE_CHANGE_PASSWORD_TITLE}
              >
                {Messages.PROFILE_CHANGE_PASSWORD_BUTTON}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileComponent;
