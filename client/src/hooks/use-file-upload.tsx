import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface UseFileUploadProps {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload({ onSuccess, onError }: UseFileUploadProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only Excel files (.xlsx, .xls) are allowed');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });

      toast({
        title: "File Uploaded Successfully",
        description: "Your Excel file has been processed and is ready for analysis.",
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onSuccess, onError, toast]);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
}
