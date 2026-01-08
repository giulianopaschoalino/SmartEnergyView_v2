import { EnergyRecord } from '../types.ts';
import { ApiClient } from './apiClient.ts';

/**
 * Normalizers: Transforms Backend Response (Snake Case) 
 * to Frontend Interface (Camel Case)
 */
const normalizeTelemetry = (record: any): EnergyRecord => ({
  timestamp: record.day_formatted || record.timestamp,
  usageKWh: parseFloat(record.consumo || 0),
  cost: parseFloat(record.cost || 0), // Note: Some backend endpoints might not return cost directly
  captiveCost: parseFloat(record.custo_cativo || 0),
  source: record.source || 'Grid'
});

export const authService = {
  login: async (credentials: any) => {
    return ApiClient.post<any>('/auth/login', credentials);
  },
  logout: async () => {
    return ApiClient.post<any>('/auth/logout');
  }
};

export const fetchConsumptionLogs = async (days: number = 30): Promise<EnergyRecord[]> => {
  try {
    // Hits TelemetryController@discretization
    const response = await ApiClient.post<any[]>('/telemetry/discretization', {
      type: '1_dia',
      filters: [
        {
          field: 'dia_num',
          type: '>=',
          value: days,
          interval: 'day'
        }
      ]
    });
    return response.map(normalizeTelemetry);
  } catch (error) {
    console.warn("Backend API telemetry error, using mock data", error);
    return generateMockData(days);
  }
};

export const fetchEconomyStats = async () => {
  try {
    // Hits EconomyController@grossAnnualEconomy
    const annual = await ApiClient.post<any[]>('/economy/grossAnnual');
    // Hits EconomyController@captiveMonthlyEconomy
    const monthly = await ApiClient.post<any[]>('/economy/estimates');
    
    return { annual, monthly };
  } catch (error) {
    console.error("Economy API error", error);
    return null;
  }
};

export const fetchPLDData = async () => {
  try {
    // Hits PldController@consumptionByDaily
    return await ApiClient.post<any[]>('/pld/daily', {
      filters: []
    });
  } catch (error) {
    console.error("PLD API error", error);
    return [];
  }
};

export const generateMockData = (days: number = 30): EnergyRecord[] => {
  const data: EnergyRecord[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const captiveTariff = 0.35; 

    data.push({
      timestamp: dateStr, usageKWh: Math.random() * 20 + 10, cost: Math.random() * 5, 
      captiveCost: 15 * captiveTariff, source: 'Grid'
    });
  }
  return data;
};

export const exportToCSV = (data: EnergyRecord[]) => {
  const headers = ['Date', 'Usage (kWh)', 'Actual Cost', 'Captive Cost', 'Source'];
  const rows = data.map(item => [
    item.timestamp,
    item.usageKWh.toFixed(3),
    item.cost.toFixed(3),
    item.captiveCost.toFixed(3),
    item.source
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `smart_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};