/**
 * API Client for Smart Energia
 * Integrated with Laravel Sanctum Authentication
 * Features: Automatic Retry, CORS Proxy Fallback, and Sanctum compatibility
 */

const BASE_URL = 'https://app.dev.smartenergia.com.br/api';

export class ApiClient {
  private static _token: string | null = null;

  static setAuthToken(token: string | null) {
    this._token = token;
  }

  private static getHeaders() {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    let token = this._token;
    
    if (!token) {
      const sessionStr = localStorage.getItem('smartenergia_session') || sessionStorage.getItem('smartenergia_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          token = session.token;
        } catch (e) {}
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Primary request method with retry logic and proxy fallback
   */
  private static async request<T>(endpoint: string, options: RequestInit, retryCount = 0): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${BASE_URL}/${cleanEndpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: { ...this.getHeaders(), ...options.headers }
      });
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // If it's a "Failed to fetch" error and we haven't exhausted retries
      if (error.name === 'TypeError' && error.message === 'Failed to fetch' && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`Fetch failed. Retrying in ${delay}ms... (Attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      // Final fallback: Try with a CORS proxy if direct fetch failed after retries
      if (error.name === 'TypeError' && error.message === 'Failed to fetch' && retryCount === 2) {
        console.warn("Direct fetch failed. Attempting with CORS proxy fallback...");
        return this.requestWithProxy<T>(url, options);
      }

      console.error(`API call to ${cleanEndpoint} failed.`, error);
      throw error;
    }
  }

  /**
   * Last-resort fallback for CORS/Network issues in dev environments
   */
  private static async requestWithProxy<T>(targetUrl: string, options: RequestInit): Promise<T> {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    try {
      const response = await fetch(proxyUrl, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers }
      });
      return await this.handleResponse<T>(response);
    } catch (proxyError: any) {
      throw new Error("Network error: Server unreachable even through proxy. Please check your connection.");
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body || {}),
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
    
    let responseData;
    try {
      responseData = isJson ? await response.json() : await response.text();
    } catch (e) {
      responseData = {};
    }

    if (!response.ok) {
      const message = (typeof responseData === 'object') 
        ? (responseData.error || responseData.message || responseData.data?.message) 
        : responseData;
      throw new Error(message || `API Error: ${response.status}`);
    }
    
    if (responseData && typeof responseData === 'object' && responseData.data !== undefined) {
      return responseData.data as T;
    }
    
    return responseData as T;
  }
}