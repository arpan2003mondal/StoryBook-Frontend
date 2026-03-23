import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService, UserProfile } from '../services/UserService';
import { ChangeUsernameRequest } from '../model/ChangeUsernameRequest';
import { Messages } from '../messages/messages';
import { Validator } from '../validators/Validation';
import '../styles/ChangeUsername.css';

const ChangeUsername = () => {
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Load current username on component mount
  useEffect(() => {
    const loadCurrentUsername = async () => {
      try {
        const profile: UserProfile = await UserService.getProfile();
        setCurrentUsername(profile.name);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setErrorMessage(Messages.FAILED_TO_LOAD_USERNAME);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCurrentUsername();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewUsername(value);
    setIsTouched(true);
    setErrorMessage('');

    // Real-time validation
    validateUsername(value);
  };

  const validateUsername = (username: string): boolean => {
    let error = '';
    let isValid = true;

    if (!username || username.trim() === '') {
      error = Messages.NEW_USERNAME_REQUIRED;
      isValid = false;
    } else if (username.trim().length === 0) {
      error = Messages.USERNAME_CANNOT_BE_EMPTY;
      isValid = false;
    } else if (username === currentUsername) {
      error = Messages.USERNAME_MUST_BE_DIFFERENT;
      isValid = false;
    } else if (!Validator.validateUsername(username)) {
      error = Messages.INVALID_NAME;
      isValid = false;
    }

    setUsernameError(error);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      const request: ChangeUsernameRequest = {
        newUsername: newUsername.trim()
      };

      const response = await UserService.changeUsername(request);
      setSuccessMessage(response.message || Messages.USERNAME_CHANGED_SUCCESS);
      setCurrentUsername(newUsername);
      setNewUsername('');
      setIsTouched(false);

      // Clear success message after 3 seconds and redirect to profile
      setTimeout(() => {
        navigate('/users/profile');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || Messages.CHANGE_USERNAME_FAILED;
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users/profile');
  };

  if (isLoadingProfile) {
    return <div className="change-username-container"><p>{Messages.LOADING}</p></div>;
  }

  return (
    <div className="change-username-container">
      <div className="change-username-form">
        <h2>{Messages.CHANGE_USERNAME_TITLE}</h2>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentUsername">{Messages.CURRENT_USERNAME_LABEL}</label>
            <input
              type="text"
              id="currentUsername"
              name="currentUsername"
              value={currentUsername}
              readOnly
              disabled
              className="current-username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newUsername">{Messages.NEW_USERNAME_LABEL}</label>
            <input
              type="text"
              id="newUsername"
              name="newUsername"
              value={newUsername}
              onChange={handleChange}
              placeholder={Messages.NEW_USERNAME_PLACEHOLDER}
              disabled={isLoading}
              className={newUsername && isTouched ? (isFormValid ? 'input-valid' : 'input-invalid') : ''}
            />
            {usernameError && (
              <span className="field-error" role="alert">
                ✗ {usernameError}
              </span>
            )}
            {newUsername && !usernameError && isTouched && (
              <span className="field-success" role="status">
                ✓ Valid username
              </span>
            )}
            <span className="validation-hint">
              {Messages.INVALID_NAME}
            </span>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="submit-btn"
            >
              {isLoading ? Messages.CHANGING_USERNAME_BUTTON : Messages.CHANGE_USERNAME_BUTTON}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="submit-btn"
              onClick={handleCancel}
            >
              {Messages.CANCEL_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeUsername;
