import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_KEY = 'user';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): any {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setAuthTokens(token: string, refreshToken?: string): void {
    this.setToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    // Decode and store user info
    try {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.setUser({
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        });
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  static clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  static decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token?: string): boolean {
    const targetToken = token || this.getToken();
    if (!targetToken) return true;

    try {
      const decoded = this.decodeToken(targetToken);
      if (!decoded) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static getTimeUntilExpiry(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return 0;
      return Math.max(0, decoded.exp * 1000 - Date.now());
    } catch {
      return 0;
    }
  }

  static shouldRefreshToken(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    // Refresh if less than 5 minutes remaining
    return timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0;
  }

  static getCurrentUser(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  static getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  static isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  static isLandlord(): boolean {
    return this.getUserRole() === 'landlord';
  }

  static isArtisan(): boolean {
    return this.getUserRole() === 'artisan';
  }

  static isServiceProvider(): boolean {
    return this.getUserRole() === 'service_provider';
  }

  static hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }
}
