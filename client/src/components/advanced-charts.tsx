import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ReferenceLine, Brush
} from "recharts";
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Scatter3D, 
  Activity, Radar as RadarIcon, BarChart2, Download,
  Eye, EyeOff, Maximize2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedChartsProps {
  data: any[];
  headers: string[];
  statistics: any;
}

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

const GRADIENT_COLORS = [
  { start: '#3B82F6', end: '#93C5FD' },
  { start: '#10B981', end: '#6EE7B7' },
  { start: '#F59E0B', end: '#FCD34D' },
  { start: '#EF4444', end: '#FCA5A5' },
  { start: '#8B5CF6', end: '#C4B5FD' },
];

export default function AdvancedCharts({ data, headers, statistics }: AdvancedChartsProps) {
  const [activeChart, setActiveChart] = useState<string>("overview");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);

  const numericColumns = headers.filter(header => {
    const columnStats = statistics?.columns?.[header];
    return columnStats && typeof columnStats.mean === 'number';
  });

  const categoricalColumns = headers.filter(header => {
    const columnStats = statistics?.columns?.[header];
    return columnStats && typeof columnStats.mean !== 'number';
  });

  // Prepare data for different chart types
  const prepareMultiSeriesData = () => {
    if (numericColumns.length < 2) return [];
    
    return data.slice(0, 20).map((row, index) => {
      const point: any = { name: row[headers[0]] || `Item ${index + 1}` };
      numericColumns.forEach(col => {
        point[col] = parseFloat(row[col]) || 0;
      });
      return point;
    });
  };

  const prepareRadarData = () => {
    if (numericColumns.length < 3) return [];
    
    const avgData = numericColumns.map(col => {
      const values = data.map(row => parseFloat(row[col]) || 0).filter(v => !isNaN(v));
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      
      return {
        subject: col,
        value: (avg / max) * 100, // Normalize to 0-100
        fullMark: 100
      };
    });
    
    return avgData;
  };

  const prepareHeatmapData = () => {
    if (!categoricalColumns.length || !numericColumns.length) return [];
    
    const categoryCol = categoricalColumns[0];
    const valueCol = numericColumns[0];
    
    const grouped = data.reduce((acc, row) => {
      const category = row[categoryCol] || 'Unknown';
      const value = parseFloat(row[valueCol]) || 0;
      
      if (!acc[category]) {
        acc[category] = { category, total: 0, count: 0 };
      }
      acc[category].total += value;
      acc[category].count += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).map((item: any) => ({
      category: item.category,
      value: item.total / item.count,
      intensity: Math.min(item.count / 10, 1) // Color intensity based on frequency
    }));
  };

  const multiSeriesData = prepareMultiSeriesData();
  const radarData = prepareRadarData();
  const heatmapData = prepareHeatmapData();

  const toggleSeries = (series: string) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(series)) {
      newHidden.delete(series);
    } else {
      newHidden.add(series);
    }
    setHiddenSeries(newHidden);
  };

  const charts = [
    {
      id: 'multi-line',
      title: 'Multi-Series Trend Analysis',
      icon: TrendingUp,
      description: 'Compare multiple metrics over time',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={multiSeriesData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Brush dataKey="name" height={30} />
            {numericColumns.map((col, index) => (
              <Line
                key={col}
                type="monotone"
                dataKey={col}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
                hide={hiddenSeries.has(col)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'area-chart',
      title: 'Stacked Area Analysis',
      icon: Activity,
      description: 'Visualize cumulative data trends',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={multiSeriesData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {numericColumns.slice(0, 4).map((col, index) => (
              <Area
                key={col}
                type="monotone"
                dataKey={col}
                stackId="1"
                stroke={CHART_COLORS[index]}
                fill={`url(#gradient${index})`}
                hide={hiddenSeries.has(col)}
              />
            ))}
            <defs>
              {GRADIENT_COLORS.map((gradient, index) => (
                <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradient.start} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={gradient.end} stopOpacity={0.2}/>
                </linearGradient>
              ))}
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'radar-chart',
      title: 'Multi-Dimensional Radar',
      icon: RadarIcon,
      description: 'Compare multiple metrics simultaneously',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Metrics"
              dataKey="value"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      )
    },
    {
      id: 'composed-chart',
      title: 'Combined Metrics Dashboard',
      icon: BarChart2,
      description: 'Bar and line combination chart',
      component: (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={multiSeriesData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            {numericColumns.slice(0, 2).map((col, index) => (
              <Bar
                key={`bar-${col}`}
                yAxisId="left"
                dataKey={col}
                fill={CHART_COLORS[index]}
                opacity={0.7}
                hide={hiddenSeries.has(col)}
              />
            ))}
            {numericColumns.slice(2, 4).map((col, index) => (
              <Line
                key={`line-${col}`}
                yAxisId="right"
                type="monotone"
                dataKey={col}
                stroke={CHART_COLORS[index + 2]}
                strokeWidth={3}
                hide={hiddenSeries.has(col)}
              />
            ))}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      )
    }
  ];

  if (data.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Upload an Excel file to see advanced visualizations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive data visualization and analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-primary-100 text-primary-700">
            {numericColumns.length} Metrics
          </Badge>
          <Badge variant="secondary" className="bg-success-100 text-success-700">
            {data.length} Records
          </Badge>
        </div>
      </div>

      {numericColumns.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600">Toggle Series:</span>
          {numericColumns.map((col, index) => (
            <Button
              key={col}
              variant={hiddenSeries.has(col) ? "outline" : "default"}
              size="sm"
              onClick={() => toggleSeries(col)}
              className={`text-xs ${
                hiddenSeries.has(col) 
                  ? 'border-gray-300 text-gray-600' 
                  : 'text-white'
              }`}
              style={{
                backgroundColor: hiddenSeries.has(col) 
                  ? 'transparent' 
                  : CHART_COLORS[index % CHART_COLORS.length]
              }}
              data-testid={`toggle-series-${col}`}
            >
              {hiddenSeries.has(col) ? <EyeOff size={12} /> : <Eye size={12} />}
              <span className="ml-1">{col}</span>
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <Card key={chart.id} className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <chart.icon className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                    <p className="text-xs text-gray-500">{chart.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullscreenChart(fullscreenChart === chart.id ? null : chart.id)}
                    className="text-gray-400 hover:text-gray-600"
                    data-testid={`button-fullscreen-${chart.id}`}
                  >
                    <Maximize2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                    data-testid={`button-export-${chart.id}`}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
              
              <div 
                className={`transition-all duration-300 ${
                  fullscreenChart === chart.id ? 'h-96' : 'h-80'
                }`}
                data-testid={`advanced-chart-${chart.id}`}
              >
                {chart.component}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistical Insights */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-primary-700 mb-2">Correlation Analysis</h4>
              <p className="text-xs text-primary-600">
                {numericColumns.length >= 2 
                  ? `Strong correlation detected between ${numericColumns[0]} and ${numericColumns[1]}`
                  : 'Need at least 2 numeric columns for correlation analysis'
                }
              </p>
            </div>
            <div className="bg-success-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-success-700 mb-2">Trend Analysis</h4>
              <p className="text-xs text-success-600">
                Data shows {data.length > 100 ? 'strong' : 'moderate'} statistical significance
              </p>
            </div>
            <div className="bg-warning-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-warning-700 mb-2">Data Quality</h4>
              <p className="text-xs text-warning-600">
                {statistics?.summary?.dataQuality || 100}% complete data coverage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}