import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { Download, BarChart3, TrendingUp, PieChart as PieChartIcon, Axis3d } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChartsGridProps {
  data: any[];
  headers: string[];
  statistics: any;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ChartsGrid({ data, headers, statistics }: ChartsGridProps) {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Find numeric columns for charts
  const numericColumns = headers.filter(header => {
    const columnStats = statistics?.columns?.[header];
    return columnStats && typeof columnStats.mean === 'number';
  });

  // Prepare data for different chart types
  const prepareBarChartData = () => {
    if (numericColumns.length === 0) return [];
    
    const column = numericColumns[0];
    return data.slice(0, 10).map((row, index) => ({
      name: row[headers[0]] || `Item ${index + 1}`,
      value: parseFloat(row[column]) || 0,
    }));
  };

  const prepareLineChartData = () => {
    if (numericColumns.length === 0) return [];
    
    const column = numericColumns[0];
    return data.slice(0, 20).map((row, index) => ({
      name: `Point ${index + 1}`,
      value: parseFloat(row[column]) || 0,
    }));
  };

  const preparePieChartData = () => {
    if (headers.length === 0) return [];
    
    // Group by first text column
    const textColumn = headers.find(h => {
      const columnStats = statistics?.columns?.[h];
      return columnStats && typeof columnStats.mean !== 'number';
    }) || headers[0];
    
    const groups = data.reduce((acc, row) => {
      const key = row[textColumn] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  };

  const prepareScatterData = () => {
    if (numericColumns.length < 2) return [];
    
    return data.slice(0, 50).map(row => ({
      x: parseFloat(row[numericColumns[0]]) || 0,
      y: parseFloat(row[numericColumns[1]]) || 0,
    }));
  };

  const barData = prepareBarChartData();
  const lineData = prepareLineChartData();
  const pieData = preparePieChartData();
  const scatterData = prepareScatterData();

  const handleExportChart = (chartType: string) => {
    // This would implement chart export functionality
    console.log(`Exporting ${chartType} chart...`);
  };

  const charts = [
    {
      id: 'bar',
      title: 'Sales by Category',
      icon: BarChart3,
      iconColor: 'text-primary-600',
      iconBg: 'bg-primary-100',
      component: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 'line',
      title: 'Revenue Trend',
      icon: TrendingUp,
      iconColor: 'text-success-600',
      iconBg: 'bg-success-100',
      component: (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 'pie',
      title: 'Market Share',
      icon: PieChartIcon,
      iconColor: 'text-warning-600',
      iconBg: 'bg-warning-100',
      component: (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: 'scatter',
      title: 'Price vs. Volume',
      icon: Axis3d,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      component: (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart data={scatterData}>
            <CartesianGrid />
            <XAxis dataKey="x" />
            <YAxis dataKey="y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {charts.map((chart) => (
        <Card key={chart.id} className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExportChart(chart.id)}
                className="text-gray-400 hover:text-gray-600"
                data-testid={`button-export-${chart.id}`}
              >
                <Download size={16} />
              </Button>
            </div>
            
            {data.length > 0 ? (
              <div className="h-64" data-testid={`chart-${chart.id}`}>
                {chart.component}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className={`w-16 h-16 ${chart.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <chart.icon className={chart.iconColor} size={24} />
                  </div>
                  <p className="text-sm text-gray-500">No data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
