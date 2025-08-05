export interface ChartDataPoint {
  name: string;
  value: number;
  x?: number;
  y?: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  xAxis?: string;
  yAxis?: string;
  color?: string;
}

export const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green  
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
];

export function prepareBarChartData(
  data: Record<string, any>[], 
  xColumn: string, 
  yColumn: string,
  limit: number = 20
): ChartDataPoint[] {
  return data
    .slice(0, limit)
    .map((row, index) => ({
      name: String(row[xColumn] || `Item ${index + 1}`),
      value: parseFloat(row[yColumn]) || 0,
    }))
    .filter(item => !isNaN(item.value));
}

export function prepareLineChartData(
  data: Record<string, any>[],
  xColumn: string,
  yColumn: string,
  limit: number = 50
): ChartDataPoint[] {
  return data
    .slice(0, limit)
    .map((row, index) => ({
      name: String(row[xColumn] || index),
      value: parseFloat(row[yColumn]) || 0,
    }))
    .filter(item => !isNaN(item.value));
}

export function preparePieChartData(
  data: Record<string, any>[],
  column: string,
  limit: number = 8
): ChartDataPoint[] {
  const groups = data.reduce((acc, row) => {
    const key = String(row[column] || 'Unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(groups)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function prepareScatterData(
  data: Record<string, any>[],
  xColumn: string,
  yColumn: string,
  limit: number = 100
): ChartDataPoint[] {
  return data
    .slice(0, limit)
    .map(row => ({
      name: `${row[xColumn]}, ${row[yColumn]}`,
      value: parseFloat(row[yColumn]) || 0,
      x: parseFloat(row[xColumn]) || 0,
      y: parseFloat(row[yColumn]) || 0,
    }))
    .filter(item => !isNaN(item.x) && !isNaN(item.y));
}

export function getOptimalChartType(
  data: Record<string, any>[],
  xColumn: string,
  yColumn: string
): 'bar' | 'line' | 'pie' | 'scatter' {
  if (!data.length) return 'bar';

  const xValues = data.map(row => row[xColumn]);
  const yValues = data.map(row => row[yColumn]);
  
  const xNumeric = xValues.filter(v => !isNaN(parseFloat(v))).length / xValues.length;
  const yNumeric = yValues.filter(v => !isNaN(parseFloat(v))).length / yValues.length;
  
  const uniqueXValues = new Set(xValues).size;
  const totalXValues = xValues.length;

  // If both are numeric and we have many data points, suggest scatter
  if (xNumeric > 0.8 && yNumeric > 0.8 && totalXValues > 20) {
    return 'scatter';
  }

  // If X has few unique values and Y is numeric, suggest bar
  if (uniqueXValues < totalXValues * 0.5 && yNumeric > 0.8) {
    return 'bar';
  }

  // If X appears to be sequential (like dates/time), suggest line
  if (xNumeric > 0.8 && yNumeric > 0.8) {
    return 'line';
  }

  // If we want to show distribution of categories, suggest pie
  if (uniqueXValues < 10 && uniqueXValues > 1) {
    return 'pie';
  }

  return 'bar'; // Default fallback
}

export function generateChartTitle(
  chartType: string,
  xColumn: string,
  yColumn?: string
): string {
  const formatColumnName = (name: string) => 
    name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const xFormatted = formatColumnName(xColumn);
  const yFormatted = yColumn ? formatColumnName(yColumn) : '';

  switch (chartType) {
    case 'bar':
      return yColumn ? `${yFormatted} by ${xFormatted}` : `Distribution of ${xFormatted}`;
    case 'line':
      return yColumn ? `${yFormatted} Trend` : `${xFormatted} Over Time`;
    case 'pie':
      return `${xFormatted} Distribution`;
    case 'scatter':
      return yColumn ? `${xFormatted} vs ${yFormatted}` : `${xFormatted} Scatter Plot`;
    default:
      return `${xFormatted} Chart`;
  }
}

export function exportChart(chartElement: HTMLElement, filename: string, format: 'png' | 'svg' = 'png') {
  if (format === 'svg') {
    const svgElement = chartElement.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      downloadBlob(blob, `${filename}.svg`);
    }
  } else {
    // Convert to PNG using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgElement = chartElement.querySelector('svg');
    
    if (svgElement && ctx) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(blob => {
          if (blob) {
            downloadBlob(blob, `${filename}.png`);
          }
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
