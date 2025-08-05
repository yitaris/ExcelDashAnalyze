import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartFiltersProps {
  headers: string[];
  selectedDataId: string | null;
  onDataIdChange: (dataId: string) => void;
  fileData: any[];
}

export default function ChartFilters({ 
  headers, 
  selectedDataId, 
  onDataIdChange, 
  fileData 
}: ChartFiltersProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [selectedChartType, setSelectedChartType] = useState<string>("");

  const handleRefresh = () => {
    // This would trigger a refresh of the charts
    console.log("Refreshing charts...");
  };

  const chartTypes = [
    { value: "bar", label: "Bar Chart" },
    { value: "line", label: "Line Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "scatter", label: "Scatter Plot" },
  ];

  return (
    <Card className="shadow-card mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Data Visualization</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {fileData.length > 1 && (
              <Select value={selectedDataId || ""} onValueChange={onDataIdChange}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-sheet">
                  <SelectValue placeholder="Select Sheet" />
                </SelectTrigger>
                <SelectContent>
                  {fileData.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id}>
                      {sheet.sheetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-column">
                <SelectValue placeholder="Select Column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedChartType} onValueChange={setSelectedChartType}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-chart-type">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              className="bg-primary-600 hover:bg-primary-700 text-white"
              data-testid="button-refresh"
            >
              <RefreshCw className="mr-2" size={16} />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
