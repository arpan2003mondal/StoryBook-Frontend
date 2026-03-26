import React, { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/VerifyEmail.css';
import { ToastService } from '../services/ToastService';
import { UserRegisterRequestState } from '../model/UserRegisterRequest';
import { Messages } from '../messages/messages';

interface LocationState {
  registrationData: UserRegisterRequestState;
}

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Redirect to register if no registration data
  if (!state?.registrationData) {
    navigate('/users/register');
    return null;
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setOtp(value);
    setOtpError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const verificationRequest = {
        email: state.registrationData.email,
        otp: otp,
        registerRequest: state.registrationData
      };

      const response = await axios.post('/users/verify-registration', verificationRequest);
      ToastService.showSuccess(response.data);
      setTimeout(() => {
        navigate('/users/login');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || Messages.REGISTRATION_FAILED;
      setOtpError(errorMsg);
      ToastService.showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel registration?')) {
      navigate('/users/register');
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-wrapper">
        <div className="verify-email-header">
          <div className="verify-email-icon">📧</div>
          <h1>Verify Your Email</h1>
          <p>We've sent a verification code to</p>
          <p className="email-display">{state.registrationData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="verify-email-form">
          <div className="form-group">
            <label htmlFor="otp" className="form-label">Enter OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              className={`form-input otp-input ${otpError ? 'error-input' : ''}`}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              autoFocus
              inputMode="numeric"
            />
            {otpError && <span className="error-message">{otpError}</span>}
          </div>

          <div className="otp-info">
            <p>Enter the 6-digit code sent to your email</p>
          </div>

          <div className="button-group">
            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="submit-button"
            >
              {isLoading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="resend-info">
          <p>Didn't receive the code? Check your spam folder or try registering again.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
