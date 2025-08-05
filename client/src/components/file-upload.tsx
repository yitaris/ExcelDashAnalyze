import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, CheckCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FileUploadProps {
  onFileUploaded: (fileId: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

export default function FileUpload({ onFileUploaded, onUploadStart, onUploadEnd }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    onUploadStart();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadedFile({
        name: result.file.originalName,
        size: result.file.size,
        rows: result.data.reduce((total: number, sheet: any) => total + sheet.rowCount, 0),
        columns: result.data.reduce((total: number, sheet: any) => total + sheet.columnCount, 0),
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      
      onFileUploaded(result.file.id);

      toast({
        title: "File Uploaded Successfully",
        description: "Your Excel file has been processed and is ready for analysis.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      onUploadEnd();
    }
  }, [onFileUploaded, onUploadStart, onUploadEnd, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="mb-8">
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} data-testid="input-file" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <CloudUpload className="text-primary-600" size={24} />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drop your Excel file here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
              <p className="text-xs text-gray-400">Supports .xlsx, .xls files up to 10MB</p>
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-success-600 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-800" data-testid="text-filename">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-success-600" data-testid="text-filestats">
                    {uploadedFile.rows.toLocaleString()} rows • {uploadedFile.columns} columns • {formatBytes(uploadedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-success-600 hover:text-success-800"
                  data-testid="button-remove-file"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
