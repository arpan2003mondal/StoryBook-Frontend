import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { LoginRequest } from '../model/LoginRequest';
import { ToastService } from '../services/ToastService';
import '../styles/Login.css';
import { Validator } from '../validators/Validation';
import { Messages } from '../messages/messages';

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));

    // Validate email on change
    if (name === 'email') {
      setEmailError(Validator.validateEmail(value) ? '' : Messages.INVALID_EMAIL);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await AuthService.login(formData.email, formData.password);
      ToastService.showSuccess(Messages.LOGIN_SUCCESS);
      setTimeout(() => {
        navigate('/storybooks');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data.message || Messages.LOGIN_FAILED;
      ToastService.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <button className="back-home-btn" onClick={handleHome} title={Messages.BACK_TO_HOME}>
        ← {Messages.BACK_TO_HOME}
      </button>
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-header-icon">🔐</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${emailError ? 'error-input' : ''}`}
              placeholder="Enter your email"
              required
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={isLoading || !!emailError} className="submit-button">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <a href="/users/register">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;