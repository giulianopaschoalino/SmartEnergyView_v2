import { EnergyRecord } from '../types.ts';

export const generateMockData = (days: number = 30): EnergyRecord[] => {
  const data: EnergyRecord[] = [];
  const now = new Date();
  
  // To handle historical data, generate more than 1 year (e.g. 1095 days = ~3 years)
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Seasonal variation (sin wave based on month)
    const month = date.getMonth();
    const seasonFactor = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI);
    
    // Tariffs: Captive is usually significantly higher in Brazil (25-40% more)
    const solarBase = (Math.random() * 15 + 5) * (seasonFactor < 1 ? seasonFactor : 1.2); 
    const gridBase = (Math.random() * 20 + 10) * seasonFactor;
    const batteryBase = (Math.random() * 8 + 2);

    // Helper for captive cost calculation (simulating ~30% higher than average grid)
    const captiveTariff = 0.35; 

    data.push({
      timestamp: dateStr,
      usageKWh: solarBase,
      cost: solarBase * 0.05,
      captiveCost: solarBase * captiveTariff,
      source: 'Solar'
    });
    data.push({
      timestamp: dateStr,
      usageKWh: gridBase,
      cost: gridBase * 0.22, 
      captiveCost: gridBase * captiveTariff,
      source: 'Grid'
    });
    data.push({
      timestamp: dateStr,
      usageKWh: batteryBase,
      cost: batteryBase * 0.08,
      captiveCost: batteryBase * captiveTariff,
      source: 'Battery'
    });
  }
  return data;
};

export const filterData = (data: EnergyRecord[], startDate: string, endDate: string, source: string): EnergyRecord[] => {
  return data.filter(item => {
    const dateMatch = (!startDate || item.timestamp >= startDate) && (!endDate || item.timestamp <= endDate);
    const sourceMatch = source === 'All' || item.source === source;
    return dateMatch && sourceMatch;
  });
};

export const exportToCSV = (data: EnergyRecord[]) => {
  const headers = ['Timestamp', 'Usage (kWh)', 'Free Cost', 'Captive Cost', 'Economy', 'Source'];
  const rows = data.map(item => [
    item.timestamp,
    item.usageKWh.toFixed(3),
    item.cost.toFixed(3),
    item.captiveCost.toFixed(3),
    (item.captiveCost - item.cost).toFixed(3),
    item.source
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `smart_energia_economy_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};