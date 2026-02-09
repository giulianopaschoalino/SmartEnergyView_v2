
import { EnergyRecord } from '../types.ts';

const generateMockTelemetry = (days: number): EnergyRecord[] => {
  const data: EnergyRecord[] = [];
  const now = new Date();
  const sources: ('Solar' | 'Grid' | 'Battery')[] = ['Solar', 'Grid', 'Battery'];
  
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    data.push({
      timestamp: d.toISOString().split('T')[0],
      usageKWh: 450 + Math.random() * 200,
      cost: 120 + Math.random() * 50,
      captiveCost: 180 + Math.random() * 40,
      source: sources[Math.floor(Math.random() * 3)]
    });
  }
  return data;
};

export const authService = {
  login: async (credentials: any) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        token: 'mock-jwt-token-xyz-123',
        user: {
          name: 'Alex Rivera',
          email: credentials.email || 'alex@smartenergia.io',
          client_id: 101,
          codigo_scde: 'SCDE-99-ALPHA',
          profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        }
      }), 800);
    });
  },
  logout: async () => Promise.resolve()
};

export const fetchClientUnits = async (clientId: number) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { unidade: "Matriz Industrial", cod_smart_unidade: 1, codigo_scde: "SCDE-001" },
      { unidade: "Escritório Central", cod_smart_unidade: 2, codigo_scde: "SCDE-002" },
      { unidade: "Centro Logístico", cod_smart_unidade: 3, codigo_scde: "SCDE-003" },
      { unidade: "Showroom Sul", cod_smart_unidade: 4, codigo_scde: "SCDE-004" }
    ]), 400);
  });
};

export const fetchConsumptionLogs = async (days: number = 30, scdeCode?: string): Promise<EnergyRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockTelemetry(days)), 600);
  });
};

export const fetchEconomyData = async (type: string, filters: any[] = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2022, 2023, 2024, 2025];
  
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      if (type === 'grossAnnual') {
        let currentAccumulated = 45000;
        const results = years.map(y => {
          // Increase by 15k-25k per year
          currentAccumulated += 15000 + (Math.random() * 10000);
          return {
            ano: y,
            economia_acumulada: currentAccumulated,
            dad_estimado: y === 2025
          };
        });
        resolve(results);
      } else if (type === 'grossMonthly') {
        let currentAccumulated = 5000;
        const results = months.map((m, i) => {
          // Increase by 3k-5k per month
          currentAccumulated += 3000 + (Math.random() * 2000);
          return {
            mes: `${i+1}/2024`,
            economia_acumulada: currentAccumulated,
            dad_estimado: i > 9
          };
        });
        resolve(results);
      } else if (type === 'estimates') {
        resolve(months.map((m, i) => ({
          mes: `${i+1}/2024`,
          custo_cativo: 12000 + Math.random() * 2000,
          custo_livre: 8000 + Math.random() * 1500,
          economia_mensal: 4000 + Math.random() * 500,
          dad_estimado: i > 8
        })));
      } else {
        resolve(months.map((m, i) => ({
          mes: `${i+1}/2024`,
          custo_unit: 450 + Math.random() * 100,
          dad_estimado: i > 10
        })));
      }
    }, 500);
  });
};

export const fetchPLDData = async (type: string) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      if (type === 'overview') {
        resolve([
          { submarket: "SE/CO", value: 125.40 },
          { submarket: "SUL", value: 125.40 },
          { submarket: "NORDESTE", value: 98.20 },
          { submarket: "NORTE", value: 85.10 }
        ]);
      } else if (type === 'daily') {
        const data = [];
        for(let i=1; i<=30; i++) data.push({ day_formatted: `${i}/03`, value: 100 + Math.random()*50 });
        resolve(data);
      } else if (type === 'schedule') {
        const data = [];
        for(let i=0; i<24; i++) data.push({ hour: i, value: 110 + Math.sin(i/4)*20 });
        resolve(data);
      } else {
        resolve({ data: [
          { year_month_formatted: "2024/02", norte: 85, nordeste: 92, sudeste: 125, sul: 125 },
          { year_month_formatted: "2024/01", norte: 80, nordeste: 88, sudeste: 110, sul: 110 }
        ]});
      }
    }, 400);
  });
};

export const fetchOperationSummary = async (filters: any[] = []) => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => resolve([
      { mes: "03/2024", unidade: "Matriz", perfil_contr: "ENEL Trading", montante_nf: 450.5, preco_nf: 115.0, nf_c_icms: 51807.5 },
      { mes: "03/2024", unidade: "Escritório", perfil_contr: "Smart Energia", montante_nf: 120.0, preco_nf: 108.0, nf_c_icms: -12960.0 },
      { mes: "02/2024", unidade: "Matriz", perfil_contr: "Equatorial", montante_nf: 500.0, preco_nf: 112.0, nf_c_icms: 56000.0 }
    ]), 500);
  });
};

export const fetchAboutUs = async () => Promise.resolve([{ about: "Smart Energia Insight is a premier energy management platform designed for the free energy market. We empower enterprises with real-time telemetry, advanced cost modeling, and AI-driven efficiency insights." }]);
export const fetchFAQ = async () => Promise.resolve([
  { question: "What is the Free Energy Market?", answer: "The Free Energy Market (ACL) allows consumers to choose their energy supplier and negotiate prices directly." },
  { question: "How does the PLD affect my costs?", answer: "The PLD is the Market Clearing Price used to settle differences between contracted and consumed energy." }
]);
export const fetchSectorialInfo = async () => Promise.resolve({ data: "#" });

export const exportToCSV = (data: any[], fileName: string = 'export') => {
  console.log("Mock Export CSV", data);
  alert("Data exported to CSV successfully (Mock Action)");
};
