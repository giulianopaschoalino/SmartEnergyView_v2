
import { fetchTelemetryMock } from './dataService.ts';

/**
 * Mock API Client for Smart Energia Prototype
 * Simulates network delays and returns hardcoded responses.
 */
export class ApiClient {
  private static _token: string | null = null;

  static setAuthToken(token: string | null) {
    this._token = token;
  }

  private static async simulateNetwork<T>(data: T, delay = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  static async get<T>(endpoint: string): Promise<T> {
    console.log(`Mock GET: ${endpoint}`);
    // This is a shell; actual data is handled in dataService
    return this.simulateNetwork({} as T);
  }

  static async post<T>(endpoint: string, body?: any): Promise<T> {
    console.log(`Mock POST: ${endpoint}`, body);
    
    // Route telemetry calls to the dedicated mock generator
    if (endpoint.includes('telemetry/')) {
      const data = await fetchTelemetryMock(endpoint, body);
      return this.simulateNetwork(data as unknown as T, 800);
    }

    return this.simulateNetwork({} as T);
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    return this.simulateNetwork({} as T);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.simulateNetwork({} as T);
  }
}
