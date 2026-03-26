import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ForgotPasswordService } from '../services/ForgotPasswordService';
import { ToastService } from '../services/ToastService';
import { Validator } from '../validators/Validation';
import { Messages } from '../messages/messages';
import '../styles/ResetPassword.css';

interface LocationState {
  email: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to forgot password if no email
  useEffect(() => {
    if (!state?.email) {
      navigate('/users/forgot-password');
    }
  }, [state, navigate]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError('');
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value) {
      setNewPasswordError(Validator.validatePassword(value) ? '' : Messages.INVALID_PASSWORD);
    } else {
      setNewPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value) {
      if (newPassword && !Validator.validateConfirmPassword(value, newPassword)) {
        setConfirmPasswordError(Messages.PASSWORD_MISMATCH);
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!otp) {
      setOtpError('OTP is required');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      return;
    }

    if (!Validator.validatePassword(newPassword)) {
      setNewPasswordError(Messages.INVALID_PASSWORD);
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }

    if (!Validator.validateConfirmPassword(confirmPassword, newPassword)) {
      setConfirmPasswordError(Messages.PASSWORD_MISMATCH);
      return;
    }

    setIsLoading(true);

    try {
      const resetRequest = {
        email: state.email,
        otp,
        newPassword,
        confirmPassword
      };

      await ForgotPasswordService.verifyOtpAndResetPassword(resetRequest);
      ToastService.showSuccess(Messages.RESET_PASSWORD_SUCCESS);
      
      setTimeout(() => {
        navigate('/users/login');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || Messages.RESET_PASSWORD_FAILED;
      setOtpError(errorMsg);
      ToastService.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel password reset?')) {
      navigate('/users/forgot-password');
    }
  };

  // Don't render form if no email in state (redirecting)
  if (!state?.email) {
    return null;
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-wrapper">
        <div className="reset-password-header">
          <div className="reset-password-icon">🔐</div>
          <h1>{Messages.RESET_PASSWORD_TITLE}</h1>
          <p>{Messages.RESET_PASSWORD_SUBTITLE}</p>
          <p className="email-display">{state.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="otp" className="form-label">{Messages.OTP_LABEL} *</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              className={`form-input otp-input ${otpError ? 'error-input' : ''}`}
              placeholder={Messages.OTP_PLACEHOLDER}
              maxLength={6}
              disabled={isLoading}
              autoFocus
              inputMode="numeric"
            />
            {otpError && <span className="error-message">{otpError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">{Messages.NEW_PASSWORD_TITLE_RESET} *</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`form-input ${newPasswordError ? 'error-input' : ''}`}
                placeholder="Enter your new password"
                required
                disabled={isLoading}
              />
              {newPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              )}
            </div>
            {newPasswordError && <span className="error-message">{newPasswordError}</span>}
            {newPassword && !newPasswordError && (
              <span className="success-message">{Messages.VALID_PASSWORD}</span>
            )}
            <p className="password-hint">{Messages.PASSWORD_VALIDATION_HINT}</p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">{Messages.CONFIRM_PASSWORD_TITLE_RESET} *</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`form-input ${confirmPasswordError ? 'error-input' : ''}`}
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
              />
              {confirmPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              )}
            </div>
            {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
            {confirmPassword && !confirmPasswordError && newPassword === confirmPassword && (
              <span className="success-message">{Messages.PASSWORDS_MATCH}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !!otpError || !!newPasswordError || !!confirmPasswordError || !otp || !newPassword || !confirmPassword}
            >
              {isLoading ? Messages.VERIFYING_OTP_BUTTON : Messages.VERIFY_OTP_BUTTON}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {Messages.CANCEL_BUTTON}
            </button>
          </div>
        </form>

      
      </div>
    </div>
  );
};

export default ResetPassword;
