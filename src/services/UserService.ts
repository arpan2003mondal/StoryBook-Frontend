import axios from 'axios';
import { StorybookResponse } from '../model/StorybookResponse';
import { WalletBalanceDTO } from '../model/WalletBalanceDTO';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  walletBalance?: number;
}

export interface UserLibraryItem {
  id: number;
  storybook: StorybookResponse;
  purchasedAt: string;
}

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
      .get('/wallet/library')
      .then(response => {
        const data = response.data;
        console.log('UserService getUserLibrary raw response:', data);
        
        // Handle backend response structure: { message, items, total }
        if (data.items && Array.isArray(data.items)) {
          console.log('Unwrapping data.items from backend response');
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
}
