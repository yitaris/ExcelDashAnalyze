import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import DataSummary from "@/components/data-summary";
import ChartFilters from "@/components/chart-filters";
import ChartsGrid from "@/components/charts-grid";
import StatisticsPanel from "@/components/statistics-panel";
import DataTable from "@/components/data-table";
import LoadingOverlay from "@/components/loading-overlay";
import { ExcelData } from "@shared/schema";

export default function Dashboard() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: files = [] } = useQuery({
    queryKey: ["/api/files"],
    enabled: true,
  });

  const { data: fileData = [] } = useQuery({
    queryKey: ["/api/files", selectedFileId, "data"],
    enabled: !!selectedFileId,
  });

  const { data: sheetData } = useQuery({
    queryKey: ["/api/data", selectedDataId],
    enabled: !!selectedDataId,
  });

  // Auto-select first file and sheet when available
  if (files.length > 0 && !selectedFileId) {
    setSelectedFileId(files[0].id);
  }

  if (fileData.length > 0 && !selectedDataId) {
    setSelectedDataId(fileData[0].id);
  }

  const handleFileUploaded = (fileId: string) => {
    setSelectedFileId(fileId);
    setSelectedDataId(null);
  };

  const handleExport = () => {
    if (sheetData) {
      const csv = convertToCSV(sheetData.data);
      downloadCSV(csv, `${sheetData.sheetName}.csv`);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${row[header] || ""}"`).join(",")
    );
    
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ChartLine className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Excel Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!sheetData}
                data-testid="button-export"
                className="text-primary-600 border-primary-200 hover:bg-primary-50"
              >
                <Download className="mr-2" size={16} />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-settings"
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload */}
        <FileUpload 
          onFileUploaded={handleFileUploaded}
          onUploadStart={() => setIsUploading(true)}
          onUploadEnd={() => setIsUploading(false)}
        />

        {sheetData && (
          <>
            {/* Data Summary */}
            <DataSummary statistics={sheetData.statistics} />

            {/* Chart Filters */}
            <ChartFilters
              headers={sheetData.headers}
              selectedDataId={selectedDataId}
              onDataIdChange={setSelectedDataId}
              fileData={fileData}
            />

            {/* Charts Grid */}
            <ChartsGrid 
              data={sheetData.data}
              headers={sheetData.headers}
              statistics={sheetData.statistics}
            />

            {/* Statistics Panel */}
            <StatisticsPanel statistics={sheetData.statistics} />

            {/* Data Table */}
            <DataTable
              data={sheetData.data}
              headers={sheetData.headers}
            />
          </>
        )}

        {!sheetData && !isUploading && files.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartLine className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">Upload an Excel file to get started with data analysis.</p>
          </div>
        )}
      </main>

      {isUploading && <LoadingOverlay />}
    </div>
  );
}
