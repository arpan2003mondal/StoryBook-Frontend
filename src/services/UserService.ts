import axios from 'axios';
import { StorybookResponse } from '../model/StorybookResponse';
import { WalletBalanceDTO } from '../model/WalletBalanceDTO';
import { ChangePasswordRequest } from '../model/ChangePasswordRequest';
import { ChangeUsernameRequest } from '../model/ChangeUsernameRequest';
import { UserProfile } from '../model/UserProfile';




export class UserService {
  static getProfile(): Promise<UserProfile> {
    return axios.get('/users/profile').then(response => response.data);
  }

  static getWalletBalance(): Promise<WalletBalanceDTO> {
    return axios.get('/wallet/balance').then(response => response.data);
  }

  /**
   * Get user's library (purchased storybooks)
   */
  static getUserLibrary(): Promise<StorybookResponse[]> {
    return axios
      .get('/library')
      .then(response => {
        const data = response.data;

        // Handle backend response structure: { message, items, total }
        if (data.items && Array.isArray(data.items)) {
          return data.items;
        }

        // Fallback for other response structures
        if (Array.isArray(data)) {
          return data;
        }
        if (data.library && Array.isArray(data.library)) {
          return data.library;
        }
        if (data.data && Array.isArray(data.data)) {
          return data.data;
        }

        return [];
      });
  }

  /**
   * Change user's password
   */
  static changePassword(request: ChangePasswordRequest): Promise<any> {
    return axios.post('/users/change-password', {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword
    }).then(response => response.data);
  }

  /**
   * Change user's username
   */
  static changeUsername(request: ChangeUsernameRequest): Promise<any> {
    return axios.post('/users/change-username', request).then(response => response.data);
  }

  /**
   * Logout user
   */
  static logout(): Promise<any> {
    return axios.post('/users/logout').then(response => response.data);
  }
}

export type { UserProfile };