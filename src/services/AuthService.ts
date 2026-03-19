import axios from 'axios';

export class AuthService {
  private static TOKEN_KEY = 'jwtToken';

  static login(email: string, password: string): Promise<string> {
    return axios
      .post('/users/login', { email, password })
      .then(response => {
        const token = response.data;
        localStorage.setItem(this.TOKEN_KEY, token);
        this.setAuthHeader(token);
        return token;
      });
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static setAuthHeader(token: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  static initializeToken(): void {
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }
}
