export interface ExcelColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  nullable: boolean;  
}

export interface ExcelSheet {
  name: string;
  columns: ExcelColumn[];
  data: Record<string, any>[];
  rowCount: number;
}

export interface ExcelFile {
  name: string;
  sheets: ExcelSheet[];
  totalRows: number;
  totalColumns: number;
}

export function detectColumnType(values: any[]): 'text' | 'number' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'text';

  // Check for boolean
  const booleanValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    (typeof v === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(v.toLowerCase()))
  );
  if (booleanValues.length > nonNullValues.length * 0.8) return 'boolean';

  // Check for numbers
  const numericValues = nonNullValues.filter(v => {
    if (typeof v === 'number') return true;
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/[$,]/g, ''));
      return !isNaN(parsed);
    }
    return false;
  });
  if (numericValues.length > nonNullValues.length * 0.8) return 'number';

  // Check for dates
  const dateValues = nonNullValues.filter(v => {
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      const parsed = new Date(v);
      return !isNaN(parsed.getTime());
    }
    return false;
  });
  if (dateValues.length > nonNullValues.length * 0.8) return 'date';

  return 'text';
}

export function calculateColumnStatistics(values: any[], columnType: string) {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  const baseStats = {
    count: values.length,
    nullCount: values.length - nonNullValues.length,
    uniqueCount: new Set(nonNullValues).size,
  };

  if (columnType === 'number') {
    const numericValues = nonNullValues
      .map(v => typeof v === 'string' ? parseFloat(v.replace(/[$,]/g, '')) : v)
      .filter(v => !isNaN(v));

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      
      const mean = sum / numericValues.length;
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
      
      return {
        ...baseStats,
        mean,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        range: sorted[sorted.length - 1] - sorted[0],
        median: sorted.length % 2 === 0 
          ? (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2
          : sorted[Math.floor(sorted.length / 2)],
        variance,
        standardDeviation: Math.sqrt(variance),
      };
    }
  }

  if (columnType === 'text') {
    const counts = nonNullValues.reduce((acc, val) => {
      const key = String(val);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(counts));
    const mode = Object.keys(counts).find(key => counts[key] === maxCount);
    
    return {
      ...baseStats,
      mode,
      averageLength: nonNullValues.reduce((acc, val) => acc + String(val).length, 0) / nonNullValues.length,
    };
  }

  return baseStats;
}

export function generateChartData(
  data: Record<string, any>[],
  xColumn: string,
  yColumn: string,
  chartType: 'bar' | 'line' | 'pie' | 'scatter'
) {
  if (chartType === 'pie') {
    // Group data by xColumn values
    const groups = data.reduce((acc, row) => {
      const key = row[xColumn] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }

  return data
    .filter(row => row[xColumn] !== null && row[xColumn] !== undefined)
    .map(row => ({
      name: String(row[xColumn]),
      value: parseFloat(row[yColumn]) || 0,
      x: parseFloat(row[xColumn]) || 0,
      y: parseFloat(row[yColumn]) || 0,
    }));
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if necessary
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
