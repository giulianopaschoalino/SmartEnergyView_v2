
export interface EnergyRecord {
  timestamp: string;
  usageKWh: number;
  cost: number;
  source: 'Solar' | 'Grid' | 'Battery';
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string | null;
  hasAgreedToPolicy: boolean;
  policyVersion: string;
}

export interface ChartFilter {
  startDate: string;
  endDate: string;
  source: 'All' | 'Solar' | 'Grid' | 'Battery';
}

export enum ViewMode {
  Dashboard = 'dashboard',
  Analysis = 'analysis',
  Settings = 'settings'
}
