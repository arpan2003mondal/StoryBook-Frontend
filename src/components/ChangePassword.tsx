import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { ChangePasswordRequest } from '../model/ChangePasswordRequest';
import { Messages } from '../messages/messages';
import { ToastService } from '../services/ToastService';
import { Validator } from '../validators/Validation';
import '../styles/ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isTouched, setIsTouched] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));

    // Mark field as touched
    setIsTouched(prevState => ({ ...prevState, [name]: true }));

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (fieldName: string, value: string): void => {
    const updatedFormData = { ...formData, [fieldName]: value };
    const newErrors = { ...errors };

    // Validate old password - only check if not empty
    if (!updatedFormData.oldPassword || updatedFormData.oldPassword.trim() === '') {
      newErrors.oldPassword = Messages.OLD_PASSWORD_REQUIRED;
    } else {
      newErrors.oldPassword = '';
    }

    // Validate new password
    if (!updatedFormData.newPassword || updatedFormData.newPassword.trim() === '') {
      newErrors.newPassword = Messages.NEW_PASSWORD_REQUIRED;
    } else if (!Validator.validatePassword(updatedFormData.newPassword)) {
      newErrors.newPassword = Messages.INVALID_PASSWORD;
    } else if (updatedFormData.oldPassword && updatedFormData.newPassword === updatedFormData.oldPassword) {
      newErrors.newPassword = Messages.NEW_PASSWORD_SAME_AS_OLD;
    } else {
      newErrors.newPassword = '';
    }

    // Validate confirm password
    if (!updatedFormData.confirmNewPassword || updatedFormData.confirmNewPassword.trim() === '') {
      newErrors.confirmNewPassword = Messages.CONFIRM_NEW_PASSWORD_REQUIRED;
    } else if (updatedFormData.newPassword && updatedFormData.confirmNewPassword !== updatedFormData.newPassword) {
      newErrors.confirmNewPassword = Messages.PASSWORDS_DO_NOT_MATCH;
    } else {
      newErrors.confirmNewPassword = '';
    }

    setErrors(newErrors);

    // Check overall form validity
    const allFieldsFilled = !!(updatedFormData.oldPassword && updatedFormData.newPassword && updatedFormData.confirmNewPassword);
    const hasNoErrors = !(newErrors.oldPassword || newErrors.newPassword || newErrors.confirmNewPassword);
    const isValid = allFieldsFilled && hasNoErrors;
    setIsFormValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      const request: ChangePasswordRequest = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      };

      const response = await UserService.changePassword(request);
      ToastService.showSuccess(response.message || Messages.PASSWORD_CHANGED_SUCCESS);

      // Reset form
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setIsTouched({
        oldPassword: false,
        newPassword: false,
        confirmNewPassword: false
      });

      // Logout immediately to clear auth state
      AuthService.logout();

      // Redirect to login after showing toast with page reload
      setTimeout(() => {
        window.location.href = '/users/login';
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || Messages.CHANGE_PASSWORD_FAILED;
      ToastService.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users/profile');
  };

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <h2>{Messages.CHANGE_PASSWORD_TITLE}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">{Messages.OLD_PASSWORD_LABEL}</label>
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder={Messages.OLD_PASSWORD_PLACEHOLDER}
                disabled={isLoading}
                className={formData.oldPassword && isTouched.oldPassword ? (!errors.oldPassword ? 'input-valid' : 'input-invalid') : ''}
              />
              {formData.oldPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isLoading}
                  aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              )}
            </div>
            {errors.oldPassword && (
              <span className="field-error" role="alert">
                ✗ {errors.oldPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">{Messages.NEW_PASSWORD_LABEL}</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={Messages.NEW_PASSWORD_PLACEHOLDER}
                disabled={isLoading}
                className={formData.newPassword && isTouched.newPassword ? (!errors.newPassword ? 'input-valid' : 'input-invalid') : ''}
              />
              {formData.newPassword && (
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
            {errors.newPassword && (
              <span className="field-error" role="alert">
                ✗ {errors.newPassword}
              </span>
            )}
            {formData.newPassword && !errors.newPassword && isTouched.newPassword && (
              <span className="field-success" role="status">
                ✓ {Messages.VALID_PASSWORD}
              </span>
            )}
            <span className="validation-hint">
              {Messages.PASSWORD_VALIDATION_HINT}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword">{Messages.CONFIRM_NEW_PASSWORD_LABEL}</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder={Messages.CONFIRM_PASSWORD_PLACEHOLDER}
                disabled={isLoading}
                className={formData.confirmNewPassword && isTouched.confirmNewPassword ? (!errors.confirmNewPassword ? 'input-valid' : 'input-invalid') : ''}
              />
              {formData.confirmNewPassword && (
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
            {errors.confirmNewPassword && (
              <span className="field-error" role="alert">
                ✗ {errors.confirmNewPassword}
              </span>
            )}
            {formData.confirmNewPassword && !errors.confirmNewPassword && isTouched.confirmNewPassword && (
              <span className="field-success" role="status">
                ✓ {Messages.PASSWORDS_MATCH}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="submit-btn"
            >
              {isLoading ? Messages.CHANGING_PASSWORD_BUTTON : Messages.CHANGE_PASSWORD_BUTTON}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="cancel-btn"
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

export default ChangePassword;
