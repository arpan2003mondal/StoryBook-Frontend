import axios from 'axios';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  walletBalance?: number;
}

export class UserService {
  static getProfile(): Promise<UserProfile> {
    return axios.get('/users/profile').then(response => response.data);
  }

  static getWalletBalance(): Promise<number> {
    return axios.get('/users/wallet-balance').then(response => response.data);
  }
}
