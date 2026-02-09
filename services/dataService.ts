import { EnergyRecord } from '../types.ts';
import { ApiClient } from './apiClient.ts';

const normalizeTelemetry = (record: any): EnergyRecord => {
  const timestamp = record.day_formatted || record.dia_num || new Date().toISOString();

  return {
    timestamp,
    usageKWh: parseFloat(record.consumo || 0),
    cost: parseFloat(record.custo_livre || record.cost || 0), 
    captiveCost: parseFloat(record.custo_cativo || 0),
    source: record.source || 'Grid'
  };
};

export const authService = {
  login: async (credentials: any) => {
    const response = await ApiClient.post<any>('auth/login', {
      ...credentials,
      device_name: 'webapp'
    });
    return {
      token: response.token,
      user: {
        name: response.user.name,
        email: response.user.email,
        clientId: response.user.client_id,
        scdeCode: response.user.codigo_scde,
        profilePhotoUrl: response.user.profile_picture
      }
    };
  },
  logout: async () => ApiClient.post<any>('auth/logout')
};

export const fetchClientUnits = async (clientId: number) => {
  try {
    return await ApiClient.post<any[]>('units', {
      filters: [
        { type: "=", field: "dados_cadastrais.cod_smart_cliente", value: clientId },
        { type: "not_in", field: "dados_cadastrais.codigo_scde", value: ["0P"] }
      ],
      fields: ["unidade", "cod_smart_unidade", "codigo_scde"],
      distinct: true
    });
  } catch (error) { return []; }
};

export const fetchConsumptionLogs = async (days: number = 30, scdeCode?: string): Promise<EnergyRecord[]> => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    
    const filters: any[] = [
      {
        type: 'between', 
        field: 'dia_num', 
        value: [startDate.toISOString().split('T')[0], now.toISOString().split('T')[0]]
      }
    ];

    if (scdeCode) {
      filters.push({ type: '=', field: 'med_5min.ponto', value: scdeCode });
    }

    const response = await ApiClient.post<any[]>('telemetry/discretization', { 
      type: '1_dia', 
      filters 
    });

    if (!response || response.length === 0) return [];
    return response.map(normalizeTelemetry);
  } catch (error) { 
    return []; 
  }
};

export const fetchEconomyData = async (type: 'grossAnnual' | 'grossMonthly' | 'estimates' | 'MWh', filters: any[] = []) => {
  try {
    const body = filters.length > 0 ? { filters } : {};
    return await ApiClient.post<any[]>(`economy/${type}`, body);
  } catch (e) { return []; }
};

export const fetchPLDData = async (type: 'overview' | 'list' | 'daily' | 'schedule', filters: any[] = []) => {
  try {
    const body = filters.length > 0 ? { filters } : {};
    return await ApiClient.post<any>(`pld/${type}`, body);
  } catch (e) { return []; }
};

export const fetchOperationSummary = async (filters: any[] = []) => {
  try {
    const body = filters.length > 0 ? { filters } : {};
    return await ApiClient.post<any[]>('operation/summary', body);
  } catch (e) { return []; }
};

export const fetchAboutUs = async () => ApiClient.get<any[]>('aboutUs');
export const fetchFAQ = async () => ApiClient.get<any[]>('faq');
export const fetchSectorialInfo = async () => ApiClient.get<any>('download');

export const exportToCSV = (data: any[], fileName: string = 'export') => {
  if (data.length === 0) return;
  const BOM = '\uFEFF';
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(h => JSON.stringify(item[h], (key, value) => value ?? '')).join(';'));
  const csvContent = [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};