import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { LoginRequest } from '../model/LoginRequest';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await AuthService.login(formData.email, formData.password);
      
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/storybooks');
      }, 1500);
      
    } catch (error: any) {
      const errorMsg = error.response?.data || "Login failed. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1>Sign In</h1>
          <p>Welcome back</p>
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

          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <button type="submit" disabled={isLoading || !!emailError} className="submit-button">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <a href="/register">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;