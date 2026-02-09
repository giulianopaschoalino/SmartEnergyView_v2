
/**
 * Utility functions to process economy data from API
 * Calculates the year with the last consolidated data and populates graphs accordingly
 */

interface EconomyData {
  ano?: string | number;
  mes?: string;
  economia_acumulada?: number;
  economia_mensal?: number;
  dad_estimado: boolean | number | string;
  custo_unit?: string | number;
  [key: string]: any;
}

function getMonthNumber(monthName: string): number {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return months.indexOf(monthName.toLowerCase()) + 1 || 1;
}

function extractYearFromMes(mesValue: string): number {
  if (!mesValue) return new Date().getFullYear();
  const mesStr = mesValue.toString();
  if (mesStr.includes('-')) return parseInt(mesStr.split('-')[0]);
  if (mesStr.includes('/')) return parseInt(mesStr.split('/')[1]);
  const parsed = parseInt(mesStr);
  return !isNaN(parsed) ? parsed : new Date().getFullYear();
}

function extractMonthFromMes(mesValue: string): number {
  if (!mesValue) return 1;
  const mesStr = mesValue.toString();
  if (mesStr.includes('-')) return parseInt(mesStr.split('-')[1]);
  if (mesStr.includes('/')) {
    const monthPart = mesStr.split('/')[0];
    const parsed = parseInt(monthPart);
    if (!isNaN(parsed)) return parsed;
    return getMonthNumber(monthPart);
  }
  return 1;
}

export function getLastConsolidatedYear(data: EconomyData[], isMonthly: boolean = false): number {
  if (!data || data.length === 0) return new Date().getFullYear();

  const consolidatedData = data.filter(item => {
    const isEst = item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true";
    if (isEst) return false;
    if (item.custo_unit !== undefined) {
      const costValue = parseFloat(String(item.custo_unit));
      return !isNaN(costValue) && costValue > 0;
    }
    return item.economia_acumulada !== undefined || item.economia_mensal !== undefined;
  });

  const allYears = data
    .map(item => isMonthly && item.mes ? extractYearFromMes(item.mes) : parseInt(item.ano?.toString() || '0'))
    .filter(year => year > 0);

  const consolidatedYears = consolidatedData
    .map(item => isMonthly && item.mes ? extractYearFromMes(item.mes) : parseInt(item.ano?.toString() || '0'))
    .filter(year => year > 0);

  if (consolidatedYears.length > 0) return Math.max(...consolidatedYears);
  if (allYears.length > 0) return Math.max(...allYears);
  return new Date().getFullYear();
}

export function populateGraphDataForYear(data: EconomyData[], targetYear: number | string): EconomyData[] {
  if (!data || data.length === 0) return [];

  const year = parseInt(targetYear.toString());
  const yearData = data.filter(item => {
    if (item.mes) {
      const itemYear = extractYearFromMes(item.mes);
      return itemYear === year;
    }
    return false;
  });

  if (yearData.length === 0) {
    const fallbackYear = data
      .map(item => (item.mes ? extractYearFromMes(item.mes) : parseInt(item.ano?.toString() || '0')))
      .filter(y => y > 0)
      .sort((a, b) => b - a)[0];
    if (!fallbackYear) return [];
    return populateGraphDataForYear(data, fallbackYear);
  }

  const dataMap = new Map<number, EconomyData>();
  yearData.forEach(item => {
    if (item.mes) {
      const month = extractMonthFromMes(item.mes);
      if (month > 0) dataMap.set(month, item);
    }
  });

  const completeYearData: EconomyData[] = [];
  for (let month = 1; month <= 12; month++) {
    if (dataMap.has(month)) {
      completeYearData.push(dataMap.get(month)!);
    } else {
      const lastConsolidated = Array.from(dataMap.values())
        .filter(item => {
          const isEst = item.dad_estimado === true || Number(item.dad_estimado) === 1 || item.dad_estimado === "true";
          return !isEst;
        })
        .sort((a, b) => extractMonthFromMes(b.mes!) - extractMonthFromMes(a.mes!))[0];

      if (lastConsolidated) {
        completeYearData.push({
          ...lastConsolidated,
          mes: `${month < 10 ? '0' : ''}${month}/${year}`,
          dad_estimado: true
        });
      } else if (dataMap.size > 0) {
        const firstData = Array.from(dataMap.values())[0];
        completeYearData.push({
          ...firstData,
          mes: `${month < 10 ? '0' : ''}${month}/${year}`,
          dad_estimado: true
        });
      }
    }
  }

  return completeYearData.sort((a, b) => extractMonthFromMes(a.mes!) - extractMonthFromMes(b.mes!));
}
