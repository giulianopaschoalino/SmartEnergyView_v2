
export interface EnergyRecord {
  timestamp: string;
  usageKWh: number;
  cost: number;
  captiveCost: number;
  source: 'Solar' | 'Grid' | 'Battery';
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string | null;
  name?: string;
  profilePhotoUrl?: string;
  clientId?: number;
  scdeCode?: string;
  token?: string;
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
  Economy = 'economy',
  Telemetry = 'telemetry',
  OperationSummary = 'operation_summary',
  News = 'news',
  PLD = 'pld',
  SectorialInfo = 'sectorial_info',
  Notifications = 'notifications',
  AboutUs = 'about_us',
  FAQ = 'faq',
  Settings = 'settings',
  Profile = 'profile'
}

export type Language = 'pt' | 'en' | 'es';
