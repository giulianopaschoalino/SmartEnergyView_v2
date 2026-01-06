
import { EnergyRecord } from '../types';

export const generateMockData = (days: number = 30): EnergyRecord[] => {
  const data: EnergyRecord[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate 3 records per day for different sources
    const solarBase = Math.random() * 15 + 5;
    const gridBase = Math.random() * 20 + 10;
    const batteryBase = Math.random() * 8 + 2;

    data.push({
      timestamp: date.toISOString().split('T')[0],
      usageKWh: solarBase,
      cost: solarBase * 0.05, // Lower cost for solar
      source: 'Solar'
    });
    data.push({
      timestamp: date.toISOString().split('T')[0],
      usageKWh: gridBase,
      cost: gridBase * 0.22, // Higher grid cost
      source: 'Grid'
    });
    data.push({
      timestamp: date.toISOString().split('T')[0],
      usageKWh: batteryBase,
      cost: batteryBase * 0.08,
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
  const headers = ['Timestamp', 'Usage (kWh)', 'Cost (USD)', 'Source'];
  const rows = data.map(item => [
    item.timestamp,
    item.usageKWh.toFixed(3),
    item.cost.toFixed(3),
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
  link.setAttribute('download', `smart_energia_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
