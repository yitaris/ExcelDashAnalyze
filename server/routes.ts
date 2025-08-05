import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExcelFileSchema, insertExcelDataSchema } from "@shared/schema";
import multer from "multer";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Extended Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

// Helper function to calculate statistics for a column
function calculateColumnStatistics(values: any[], columnName: string) {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  const numericValues = nonNullValues
    .map(v => typeof v === 'string' ? parseFloat(v) : v)
    .filter(v => !isNaN(v));

  const stats: any = {
    count: values.length,
    nullCount: values.length - nonNullValues.length,
    uniqueCount: new Set(nonNullValues).size,
  };

  if (numericValues.length > 0) {
    // Numeric statistics
    const sorted = [...numericValues].sort((a, b) => a - b);
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    
    stats.mean = sum / numericValues.length;
    stats.min = sorted[0];
    stats.max = sorted[sorted.length - 1];
    stats.range = stats.max - stats.min;
    
    // Median
    const mid = Math.floor(sorted.length / 2);
    stats.median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Standard deviation
    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - stats.mean, 2), 0) / numericValues.length;
    stats.variance = variance;
    stats.standardDeviation = Math.sqrt(variance);
  } else if (nonNullValues.length > 0) {
    // Text statistics
    const counts = nonNullValues.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(counts));
    stats.mode = Object.keys(counts).find(key => counts[key] === maxCount);
  }

  return stats;
}

// Helper function to calculate summary statistics
function calculateSummaryStats(headers: string[], data: any[]) {
  const totalRecords = data.length;
  const totalColumns = headers.length;
  
  let numericColumns = 0;
  let textColumns = 0;
  let totalMissingValues = 0;

  headers.forEach(header => {
    const columnValues = data.map(row => row[header]);
    const nonNullValues = columnValues.filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = nonNullValues
      .map(v => typeof v === 'string' ? parseFloat(v) : v)
      .filter(v => !isNaN(v));

    if (numericValues.length > nonNullValues.length * 0.5) {
      numericColumns++;
    } else {
      textColumns++;
    }

    totalMissingValues += columnValues.length - nonNullValues.length;
  });

  const dataQuality = totalRecords > 0 ? 
    Math.round(((totalRecords * totalColumns - totalMissingValues) / (totalRecords * totalColumns)) * 100) : 
    100;

  return {
    totalRecords,
    totalColumns,
    numericColumns,
    textColumns,
    missingValues: totalMissingValues,
    dataQuality,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload Excel file
  app.post("/api/upload", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file data
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };

      const validatedFile = insertExcelFileSchema.parse(fileData);
      const excelFile = await storage.createExcelFile(validatedFile);

      // Parse Excel file
      const workbook = XLSX.readFile(req.file.path);
      const results = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) continue;

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);
        
        // Convert rows to objects
        const data = rows.map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = (row as any[])[index] || null;
          });
          return obj;
        });

        // Calculate statistics for each column
        const columnStats: Record<string, any> = {};
        headers.forEach(header => {
          const columnValues = data.map(row => row[header]);
          columnStats[header] = calculateColumnStatistics(columnValues, header);
        });

        // Calculate summary statistics
        const summaryStats = calculateSummaryStats(headers, data);

        const excelDataEntry = {
          fileId: excelFile.id,
          sheetName,
          headers,
          data,
          rowCount: data.length,
          columnCount: headers.length,
          statistics: {
            columns: columnStats,
            summary: summaryStats,
          },
        };

        const validatedData = insertExcelDataSchema.parse(excelDataEntry);
        const savedData = await storage.createExcelData(validatedData);
        results.push(savedData);
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        file: excelFile,
        data: results,
      });
    } catch (error) {
      // Clean up file if there was an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error processing file" 
      });
    }
  });

  // Get all uploaded files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllExcelFiles();
      res.json(files);
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({ message: "Error retrieving files" });
    }
  });

  // Get file data
  app.get("/api/files/:fileId/data", async (req, res) => {
    try {
      const { fileId } = req.params;
      const data = await storage.getExcelData(fileId);
      res.json(data);
    } catch (error) {
      console.error('Error getting file data:', error);
      res.status(500).json({ message: "Error retrieving file data" });
    }
  });

  // Get specific sheet data
  app.get("/api/data/:dataId", async (req, res) => {
    try {
      const { dataId } = req.params;
      const data = await storage.getExcelDataById(dataId);
      
      if (!data) {
        return res.status(404).json({ message: "Data not found" });
      }

      res.json(data);
    } catch (error) {
      console.error('Error getting sheet data:', error);
      res.status(500).json({ message: "Error retrieving sheet data" });
    }
  });

  // Delete file and associated data
  app.delete("/api/files/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const deleted = await storage.deleteExcelFile(fileId);
      
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: "Error deleting file" });
    }
  });

  // Generate chart data
  app.post("/api/chart-data", async (req, res) => {
    try {
      const { dataId, chartType, xColumn, yColumn } = req.body;
      
      const data = await storage.getExcelDataById(dataId);
      if (!data) {
        return res.status(404).json({ message: "Data not found" });
      }

      const chartData = (data.data as any[]).map((row: any) => ({
        x: row[xColumn],
        y: row[yColumn],
        label: row[xColumn],
      }));

      res.json({
        type: chartType,
        data: chartData,
        xColumn,
        yColumn,
      });
    } catch (error) {
      console.error('Error generating chart data:', error);
      res.status(500).json({ message: "Error generating chart data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
