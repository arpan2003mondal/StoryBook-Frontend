import axiosInstance from '../utils/axiosConfig';

export class AuthService {
  private static TOKEN_KEY = 'jwtToken';
  private static USER_ID_KEY = 'userId';

  static async login(email: string, password: string): Promise<string> {
    try {
      const response = await axiosInstance.post('/users/login', { email, password });
      const token = response.data;
      localStorage.setItem(this.TOKEN_KEY, token);
      
      // Fetch and store user profile to get userId
      try {
        const profileResponse = await axiosInstance.get('/users/profile');
        const userId = profileResponse.data.id;
        localStorage.setItem(this.USER_ID_KEY, String(userId));
      } catch (profileError) {
        console.error('Failed to fetch user profile after login:', profileError);
      }
      
      return token;
    } catch (error) {
      throw error;
    }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUserId(): number | null {
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return userId ? parseInt(userId) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
