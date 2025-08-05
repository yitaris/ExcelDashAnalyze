import { type ExcelFile, type ExcelData, type InsertExcelFile, type InsertExcelData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Excel files
  createExcelFile(file: InsertExcelFile): Promise<ExcelFile>;
  getExcelFile(id: string): Promise<ExcelFile | undefined>;
  getAllExcelFiles(): Promise<ExcelFile[]>;
  deleteExcelFile(id: string): Promise<boolean>;

  // Excel data
  createExcelData(data: InsertExcelData): Promise<ExcelData>;
  getExcelData(fileId: string): Promise<ExcelData[]>;
  getExcelDataById(id: string): Promise<ExcelData | undefined>;
  deleteExcelData(fileId: string): Promise<boolean>;
  updateExcelDataStatistics(id: string, statistics: any): Promise<ExcelData | undefined>;
}

export class MemStorage implements IStorage {
  private excelFiles: Map<string, ExcelFile>;
  private excelData: Map<string, ExcelData>;

  constructor() {
    this.excelFiles = new Map();
    this.excelData = new Map();
  }

  async createExcelFile(insertFile: InsertExcelFile): Promise<ExcelFile> {
    const id = randomUUID();
    const file: ExcelFile = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
    };
    this.excelFiles.set(id, file);
    return file;
  }

  async getExcelFile(id: string): Promise<ExcelFile | undefined> {
    return this.excelFiles.get(id);
  }

  async getAllExcelFiles(): Promise<ExcelFile[]> {
    return Array.from(this.excelFiles.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async deleteExcelFile(id: string): Promise<boolean> {
    // Also delete associated data
    const dataEntries = Array.from(this.excelData.values()).filter(d => d.fileId === id);
    dataEntries.forEach(d => this.excelData.delete(d.id));
    
    return this.excelFiles.delete(id);
  }

  async createExcelData(insertData: InsertExcelData): Promise<ExcelData> {
    const id = randomUUID();
    const data: ExcelData = {
      ...insertData,
      id,
      createdAt: new Date(),
    };
    this.excelData.set(id, data);
    return data;
  }

  async getExcelData(fileId: string): Promise<ExcelData[]> {
    return Array.from(this.excelData.values()).filter(d => d.fileId === fileId);
  }

  async getExcelDataById(id: string): Promise<ExcelData | undefined> {
    return this.excelData.get(id);
  }

  async deleteExcelData(fileId: string): Promise<boolean> {
    const dataEntries = Array.from(this.excelData.values()).filter(d => d.fileId === fileId);
    let deleted = false;
    dataEntries.forEach(d => {
      this.excelData.delete(d.id);
      deleted = true;
    });
    return deleted;
  }

  async updateExcelDataStatistics(id: string, statistics: any): Promise<ExcelData | undefined> {
    const data = this.excelData.get(id);
    if (data) {
      const updated = { ...data, statistics };
      this.excelData.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
