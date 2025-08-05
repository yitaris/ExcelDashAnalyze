import { useState } from "react";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Target, Zap, BarChart3, PieChart, Activity, Brain
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataInsightsProps {
  data: any[];
  headers: string[];
  statistics: any;
}

export default function DataInsights({ data, headers, statistics }: DataInsightsProps) {
  const [activeInsight, setActiveInsight] = useState("overview");

  if (!data.length) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Brain className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Unavailable</h3>
          <p className="text-gray-500">Upload data to generate intelligent insights and recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = headers.filter(header => {
    const columnStats = statistics?.columns?.[header];
    return columnStats && typeof columnStats.mean === 'number';
  });

  const categoricalColumns = headers.filter(header => {
    const columnStats = statistics?.columns?.[header];
    return columnStats && typeof columnStats.mean !== 'number';
  });

  // Generate insights
  const generateTrendInsights = () => {
    if (numericColumns.length === 0) return [];
    
    return numericColumns.slice(0, 3).map(col => {
      const columnStats = statistics?.columns?.[col];
      const mean = columnStats?.mean || 0;
      const stdDev = columnStats?.standardDeviation || 0;
      const variance = columnStats?.variance || 0;
      
      const trendDirection = mean > (columnStats?.median || 0) ? 'up' : 'down';
      const variability = stdDev / mean > 0.3 ? 'high' : stdDev / mean > 0.15 ? 'medium' : 'low';
      
      return {
        column: col,
        trend: trendDirection,
        variability,
        mean: mean.toFixed(2),
        confidence: variability === 'low' ? 95 : variability === 'medium' ? 85 : 70,
        insight: `${col} shows ${trendDirection === 'up' ? 'positive' : 'negative'} trend with ${variability} variability`
      };
    });
  };

  const generateQualityInsights = () => {
    const summary = statistics?.summary || {};
    const dataQuality = summary.dataQuality || 100;
    const missingValues = summary.missingValues || 0;
    const totalCells = (summary.totalRecords || 0) * (summary.totalColumns || 0);
    
    const qualityScore = dataQuality;
    const completeness = totalCells > 0 ? ((totalCells - missingValues) / totalCells) * 100 : 100;
    
    return {
      overall: qualityScore,
      completeness: completeness.toFixed(1),
      issues: missingValues,
      recommendations: [
        missingValues > totalCells * 0.1 ? "Consider data cleaning for missing values" : "Data completeness is excellent",
        numericColumns.length < 2 ? "Add more numeric columns for better analysis" : "Good numeric data coverage",
        data.length < 100 ? "Larger dataset would improve statistical significance" : "Dataset size is adequate"
      ]
    };
  };

  const generatePatternInsights = () => {
    if (!categoricalColumns.length) return [];
    
    const patterns = categoricalColumns.slice(0, 2).map(col => {
      const values = data.map(row => row[col]).filter(v => v != null);
      const uniqueValues = new Set(values);
      const distribution = Array.from(uniqueValues).map(val => ({
        value: val,
        count: values.filter(v => v === val).length,
        percentage: (values.filter(v => v === val).length / values.length * 100).toFixed(1)
      })).sort((a, b) => b.count - a.count);
      
      const dominantValue = distribution[0];
      const diversity = uniqueValues.size / values.length;
      
      return {
        column: col,
        dominantValue: dominantValue?.value || 'N/A',
        dominantPercentage: dominantValue?.percentage || '0',
        diversity: diversity > 0.5 ? 'high' : diversity > 0.2 ? 'medium' : 'low',
        uniqueCount: uniqueValues.size,
        insight: `${col} is dominated by "${dominantValue?.value}" (${dominantValue?.percentage}%) with ${diversity > 0.5 ? 'high' : 'low'} diversity`
      };
    });
    
    return patterns;
  };

  const trendInsights = generateTrendInsights();
  const qualityInsights = generateQualityInsights();
  const patternInsights = generatePatternInsights();

  const insightTabs = [
    {
      id: "trends",
      label: "Trend Analysis",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          {trendInsights.map((insight, index) => (
            <Card key={index} className="border-l-4 border-l-primary-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{insight.column}</h4>
                  <div className="flex items-center space-x-2">
                    {insight.trend === 'up' ? (
                      <TrendingUp className="text-success-600" size={16} />
                    ) : (
                      <TrendingDown className="text-error-600" size={16} />
                    )}
                    <Badge variant={insight.variability === 'low' ? 'default' : 'secondary'}>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.insight}</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Mean:</span>
                    <span className="ml-1 font-medium">{insight.mean}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trend:</span>
                    <span className={`ml-1 font-medium ${
                      insight.trend === 'up' ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {insight.trend === 'up' ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Variability:</span>
                    <span className="ml-1 font-medium capitalize">{insight.variability}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: "quality",
      label: "Data Quality",
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-700">{qualityInsights.overall}%</div>
                <div className="text-sm text-primary-600">Overall Quality</div>
                <Progress value={qualityInsights.overall} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success-50 to-success-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success-700">{qualityInsights.completeness}%</div>
                <div className="text-sm text-success-600">Completeness</div>
                <Progress value={parseFloat(qualityInsights.completeness)} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-warning-50 to-warning-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning-700">{qualityInsights.issues}</div>
                <div className="text-sm text-warning-600">Missing Values</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Target className="mr-2 text-primary-600" size={16} />
                Recommendations
              </h4>
              <div className="space-y-2">
                {qualityInsights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      rec.includes('excellent') || rec.includes('adequate') 
                        ? 'bg-success-500' 
                        : rec.includes('Consider') 
                          ? 'bg-warning-500' 
                          : 'bg-primary-500'
                    }`} />
                    <p className="text-sm text-gray-600">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "patterns",
      label: "Pattern Detection",
      icon: Activity,
      content: (
        <div className="space-y-4">
          {patternInsights.map((pattern, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{pattern.column}</h4>
                  <Badge variant={pattern.diversity === 'high' ? 'default' : 'secondary'}>
                    {pattern.diversity} diversity
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{pattern.insight}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{pattern.dominantValue}</div>
                    <div className="text-xs text-gray-500">Most common value ({pattern.dominantPercentage}%)</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{pattern.uniqueCount}</div>
                    <div className="text-xs text-gray-500">Unique values</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }
  ];

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
              <p className="text-sm text-gray-600">Intelligent analysis and recommendations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <Zap size={12} className="mr-1" />
              AI Generated
            </Badge>
          </div>
        </div>

        <Tabs value={activeInsight} onValueChange={setActiveInsight}>
          <TabsList className="grid w-full grid-cols-3">
            {insightTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {insightTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}