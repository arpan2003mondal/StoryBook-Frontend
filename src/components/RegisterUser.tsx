import React, { FormEvent, useState } from 'react';
import '../styles/RegisterUser.css';
import { Validator } from '../validators/Validation';
import { Messages } from '../messages/messages';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserRegisterRequestState } from '../model/UserRegisterRequest';
import { FormErrorState } from '../model/FormErrorState';


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

  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));

    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post('/users/register', formData);
      setSuccessMessage(response.data);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Registration failed. Please try again.");
    }
  }


  const validateField = (name: string, value: any) : void => {
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
  Object.values(errors).every(error => error === '')  );
  }


  

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
              placeholder="Enter your email address"
            />
            {formErrors.emailError && <span className="error-message">{formErrors.emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${formErrors.passwordError ? 'error-input' : ''}`}
              placeholder="Minimum 6 characters"
            />
            {formErrors.passwordError && <span className="error-message">{formErrors.passwordError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${formErrors.confirmPasswordError ? 'error-input' : ''}`}
              placeholder="Confirm your password"
            />
            {formErrors.confirmPasswordError && <span className="error-message">{formErrors.confirmPasswordError}</span>}
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
