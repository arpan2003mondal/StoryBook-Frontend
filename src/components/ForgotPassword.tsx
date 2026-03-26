import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordService } from '../services/ForgotPasswordService';
import { ToastService } from '../services/ToastService';
import { Validator } from '../validators/Validation';
import { Messages } from '../messages/messages';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (value) {
            setEmailError(Validator.validateEmail(value) ? '' : Messages.INVALID_EMAIL);
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (!Validator.validateEmail(email)) {
            setEmailError(Messages.INVALID_EMAIL);
            return;
        }

        setIsLoading(true);

        try {
            const response = await ForgotPasswordService.requestPasswordReset({ email });
            ToastService.showSuccess(Messages.FORGOT_PASSWORD_SUCCESS);

            // Navigate to reset password page with email
            setTimeout(() => {
                navigate('/users/reset-password', { state: { email } });
            }, 1500);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || Messages.FORGOT_PASSWORD_FAILED;
            setEmailError(errorMsg);
            // ToastService.showError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/users/login');
    };

    return (
        <div className="forgot-password-container">

            <div className="forgot-password-wrapper">
                <div className="forgot-password-header">
                    <div className="forgot-password-icon">🔑</div>
                    <h1>{Messages.FORGOT_PASSWORD_TITLE}</h1>
                    <p>{Messages.FORGOT_PASSWORD_SUBTITLE}</p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address *</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            className={`form-input ${emailError ? 'error-input' : ''}`}
                            placeholder="Enter your email address"
                            required
                            disabled={isLoading}
                        />
                        {emailError && <span className="error-message">{emailError}</span>}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !!emailError || !email}
                        >
                            {isLoading ? Messages.SENDING_OTP_BUTTON : Messages.SEND_OTP_BUTTON}
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

export default ForgotPassword;
