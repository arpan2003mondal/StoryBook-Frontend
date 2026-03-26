import React, { FormEvent, useState } from 'react';
import '../styles/RegisterUser.css';
import { Validator } from '../validators/Validation';
import { Messages } from '../messages/messages';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserRegisterRequestState } from '../model/UserRegisterRequest';
import { FormErrorState } from '../model/FormErrorState';
import { ToastService } from '../services/ToastService';


const RegisterUser = () => {
  const navigate = useNavigate(); // Moved inside the component to fix the React Hook error

  const [formData, setFormData] = useState<UserRegisterRequestState & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });



  const [formErrors, setFormErrors] = useState<FormErrorState>({
    nameError: '',
    emailError: '',
    passwordError: '',
    confirmPasswordError: ''
  });

  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));

    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/users/register', formData);
      ToastService.showSuccess(response.data);
      // Navigate to verify email with registration data
      setTimeout(() => {
        navigate('/users/verify-email', { state: { registrationData: formData } });
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || Messages.REGISTRATION_FAILED;
      ToastService.showError(errorMsg);
      setIsLoading(false);
    }
  };

  const validateField = (name: string, value: any): void => {
    let errors = formErrors;

    switch (name) {
      case 'name':
        errors.nameError = Validator.validateUsername(value) ? '' : Messages.INVALID_NAME;
        break;
      case 'email':
        errors.emailError = Validator.validateEmail(value) ? '' : Messages.INVALID_EMAIL;
        break;
      case 'password':
        errors.passwordError = Validator.validatePassword(value) ? '' : Messages.INVALID_PASSWORD;
        break;
      case 'confirmPassword':
        errors.confirmPasswordError = Validator.validateConfirmPassword(value, formData.password) ? '' : Messages.PASSWORD_MISMATCH;
        break;
    }
    setFormErrors(errors);

    // Check overall form validity
    setIsValid(Validator.validateUserRegisterRequest(formData) &&
      Object.values(errors).every(error => error === ''));
  }


  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="register-container">

      <div className="register-wrapper">
        <div className="register-header">
          <div className="register-header-icon">✨</div>
          <h1>Create Account</h1>
          <p>Join our community of storytellers</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`form-input ${formErrors.nameError ? 'error-input' : ''}`}
              placeholder="Enter your full name"
            />
            {formErrors.nameError && <span className="error-message">{formErrors.nameError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${formErrors.emailError ? 'error-input' : ''}`}
              disabled={isLoading}
              placeholder="Enter your email address"
            />
            {formErrors.emailError && <span className="error-message">{formErrors.emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`form-input ${formErrors.passwordError ? 'error-input' : ''}`}
                placeholder="Enter your password"
              />
              {formData.password && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              )}
            </div>
            {formErrors.passwordError && <span className="error-message">{formErrors.passwordError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`form-input ${formErrors.confirmPasswordError ? 'error-input' : ''}`}
                placeholder="Confirm your password"
              />
              {formData.confirmPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              )}
            </div>
            {formErrors.confirmPasswordError && <span className="error-message">{formErrors.confirmPasswordError}</span>}
          </div>

          <button type="submit" disabled={!isValid || isLoading} className="submit-button">
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span className="button-text">Setting up your account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner-large"></div>
              <p className="loading-message">Sending verification code to your email...</p>
              <p className="loading-subtext">This may take a few seconds</p>
            </div>
          </div>
        )}

        <div className="login-link">
          Already have an account? <a href="/users/login">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
