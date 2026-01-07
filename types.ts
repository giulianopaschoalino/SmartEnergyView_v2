
export interface EnergyRecord {
  timestamp: string;
  usageKWh: number;
  cost: number;
  captiveCost: number; // Added to calculate economy
  source: 'Solar' | 'Grid' | 'Battery';
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string | null;
  hasAgreedToPolicy: boolean;
  policyVersion: string;
  keepLoggedIn?: boolean;
}

export interface ChartFilter {
  startDate: string;
  endDate: string;
  source: 'All' | 'Solar' | 'Grid' | 'Battery';
}

export interface Alert {
  id: string;
  type: 'usage' | 'cost';
  threshold: number;
  condition: 'greater' | 'less';
  enabled: boolean;
  source: 'All' | 'Solar' | 'Grid' | 'Battery';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'info';
}

export enum ViewMode {
  Dashboard = 'dashboard',
  Analysis = 'analysis',
  Economy = 'economy',
  Historical = 'historical',
  Alerts = 'alerts',
  News = 'news',
  PLD = 'pld', // New PLD View
  Settings = 'settings',
  Profile = 'profile'
}

export type Language = 'en' | 'pt' | 'es';
