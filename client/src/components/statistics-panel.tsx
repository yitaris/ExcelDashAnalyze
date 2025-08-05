import { Card, CardContent } from "@/components/ui/card";

interface StatisticsPanelProps {
  statistics: any;
}

export default function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  const columns = statistics?.columns || {};
  
  // Find the first numeric column for statistics display
  const numericColumn = Object.keys(columns).find(key => {
    const col = columns[key];
    return col && typeof col.mean === 'number';
  });

  const stats = numericColumn ? columns[numericColumn] : null;

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const statisticsData = [
    {
      label: 'Mean',
      value: stats ? formatNumber(stats.mean) : 'N/A',
      testId: 'text-mean',
    },
    {
      label: 'Median', 
      value: stats ? formatNumber(stats.median) : 'N/A',
      testId: 'text-median',
    },
    {
      label: 'Std Dev',
      value: stats ? formatNumber(stats.standardDeviation) : 'N/A', 
      testId: 'text-stddev',
    },
    {
      label: 'Range',
      value: stats ? formatNumber(stats.range) : 'N/A',
      testId: 'text-range',
    },
  ];

  return (
    <Card className="shadow-card mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistical Summary</h2>
        {numericColumn ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Showing statistics for: <span className="font-medium">{numericColumn}</span></p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsData.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900" data-testid={stat.testId}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        {!numericColumn && (
          <div className="text-center py-8">
            <p className="text-gray-500">No numeric columns available for statistical analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
