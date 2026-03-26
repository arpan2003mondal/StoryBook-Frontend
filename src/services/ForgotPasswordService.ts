import axios from 'axios';
import { ForgotPasswordRequest } from '../model/ForgotPasswordRequest';
import { ResetPasswordRequest } from '../model/ResetPasswordRequest';

export class ForgotPasswordService {
  static requestPasswordReset(forgotPasswordRequest: ForgotPasswordRequest): Promise<string> {
    return axios
      .post('/users/forgot-password', forgotPasswordRequest)
      .then(response => response.data);
  }

  static verifyOtpAndResetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<string> {
    return axios
      .post('/users/reset-password', resetPasswordRequest)
      .then(response => response.data);
  }
}
