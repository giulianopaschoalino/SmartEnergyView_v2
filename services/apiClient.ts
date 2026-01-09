
/**
 * API Client for Smart Energia
 * Integrated with Laravel Sanctum Authentication and Request Optimization
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.energiasmart.com.br/api';

export class ApiClient {
  private static _token: string | null = null;
  private static _activeRequests = new Map<string, AbortController>();

  static setAuthToken(token: string | null) {
    this._token = token;
  }

  private static getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
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

  /**
   * Universal fetch with AbortController support to optimize performance
   */
  private static async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Optimization: Cancel existing identical request to prevent duplicate loading
    if (this._activeRequests.has(endpoint)) {
      this._activeRequests.get(endpoint)?.abort();
    }

    const controller = new AbortController();
    this._activeRequests.set(endpoint, controller);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers },
        signal: controller.signal
      });
      return await this.handleResponse<T>(response);
    } finally {
      this._activeRequests.delete(endpoint);
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this._token = null;
      window.dispatchEvent(new CustomEvent('api-unauthorized'));
    }
    
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const responseData = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const message = (typeof responseData === 'object') 
        ? (responseData.error || responseData.message) 
        : responseData;
      throw new Error(message || `Request failed with status ${response.status}`);
    }
    
    return (responseData && responseData.data !== undefined ? responseData.data : responseData) as T;
  }
}
