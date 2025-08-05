import { Database, Columns, AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DataSummaryProps {
  statistics: any;
}

export default function DataSummary({ statistics }: DataSummaryProps) {
  const summary = statistics?.summary || {};

  const stats = [
    {
      label: "Total Records",
      value: summary.totalRecords?.toLocaleString() || "0",
      change: "+12% from last upload",
      icon: Database,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      changeColor: "text-success-600",
    },
    {
      label: "Columns Detected",
      value: summary.totalColumns || "0",
      change: `${summary.numericColumns || 0} numeric, ${summary.textColumns || 0} text`,
      icon: Columns,
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
      changeColor: "text-gray-500",
    },
    {
      label: "Missing Values",
      value: summary.missingValues?.toLocaleString() || "0",
      change: `${summary.totalRecords > 0 ? ((summary.missingValues / (summary.totalRecords * summary.totalColumns)) * 100).toFixed(1) : 0}% of total data`,
      icon: AlertTriangle,
      iconBg: "bg-error-100",
      iconColor: "text-error-600",
      changeColor: "text-error-600",
    },
    {
      label: "Data Quality",
      value: `${summary.dataQuality || 100}%`,
      change: summary.dataQuality >= 90 ? "Excellent" : summary.dataQuality >= 70 ? "Good" : "Needs Attention",
      icon: Shield,
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
      changeColor: summary.dataQuality >= 90 ? "text-success-600" : summary.dataQuality >= 70 ? "text-warning-600" : "text-error-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="shadow-card hover:shadow-card-hover transition-shadow duration-200"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500" data-testid={`text-label-${index}`}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1" data-testid={`text-value-${index}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-1 ${stat.changeColor}`} data-testid={`text-change-${index}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-full flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
