/**
 * API Client for Smart Energia
 * Integrated with Laravel Sanctum Authentication
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.energiasmart.com.br/api';

export class ApiClient {
  private static _token: string | null = null;

  /**
   * Set the auth token in memory for immediate use
   */
  static setAuthToken(token: string | null) {
    this._token = token;
  }

  private static getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // Prioritize memory token, fallback to storage
    let token = this._token;
    
    if (!token) {
      const sessionStr = localStorage.getItem('smartenergia_session') || sessionStorage.getItem('smartenergia_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          token = session.token;
        } catch (e) {
          console.error("Error parsing session for token", e);
        }
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('api-unauthorized'));
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return (result.data !== undefined ? result.data : result) as T;
  }
}
