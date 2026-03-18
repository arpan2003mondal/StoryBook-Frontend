import React, { useState } from 'react';
import './RegisterUser.css';
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '../validators/validators';
import { messages } from '../messages/messages';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserRegisterRequestState } from '../model/UserRegisterRequest';
import { FormErrorState } from '../model/FormErrorState';

const RegisterUser = () => {
  const navigate = useNavigate(); // Moved inside the component to fix the React Hook error

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        newErrors.name = validateUsername(value);
        break;
      case 'email':
        newErrors.email = validateEmail(value);
        break;
      case 'password':
        newErrors.password = validatePassword(value);
        if (formData.confirmPassword) {
          newErrors.confirmPassword = validateConfirmPassword(value, formData.confirmPassword);
        }
        break;
      case 'confirmPassword':
        newErrors.confirmPassword = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some((err) => err !== '');
    const allFieldsFilled = !!(formData.name && formData.email && formData.password && formData.confirmPassword);
    setIsValid(!hasErrors && allFieldsFilled);
  };

  const toHome = () => {
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!isValid) {
      setErrorMessage('Please fix all errors before submitting.');
      return;
    }

    try {
      const registerRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      const response = await axios.post('http://localhost:1234/users/register', registerRequest, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setSuccessMessage('Registration successful! Redirecting to home...');
      console.log('Registration successful:', response.data);
      setTimeout(toHome, 2000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error during registration. Please try again.');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us today and get started</p>
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
              className={`form-input ${errors.name ? 'error-input' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error-input' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error-input' : ''}`}
              placeholder="Minimum 6 characters"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <button type="submit" disabled={!isValid} className="submit-button">
            Create Account
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
