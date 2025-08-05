import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const excelFiles = pgTable("excel_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const excelData = pgTable("excel_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileId: varchar("file_id").notNull().references(() => excelFiles.id, { onDelete: "cascade" }),
  sheetName: text("sheet_name").notNull(),
  headers: jsonb("headers").notNull(), // Array of column names
  data: jsonb("data").notNull(), // Array of row objects
  rowCount: integer("row_count").notNull(),
  columnCount: integer("column_count").notNull(),
  statistics: jsonb("statistics"), // Statistical analysis results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExcelFileSchema = createInsertSchema(excelFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertExcelDataSchema = createInsertSchema(excelData).omit({
  id: true,
  createdAt: true,
});

export type InsertExcelFile = z.infer<typeof insertExcelFileSchema>;
export type InsertExcelData = z.infer<typeof insertExcelDataSchema>;
export type ExcelFile = typeof excelFiles.$inferSelect;
export type ExcelData = typeof excelData.$inferSelect;

// Chart data types
export const chartConfigSchema = z.object({
  type: z.enum(["bar", "line", "pie", "scatter"]),
  xColumn: z.string(),
  yColumn: z.string(),
  title: z.string(),
});

export type ChartConfig = z.infer<typeof chartConfigSchema>;

// Statistics types
export const statisticsSchema = z.object({
  mean: z.number().optional(),
  median: z.number().optional(),
  mode: z.union([z.number(), z.string()]).optional(),
  standardDeviation: z.number().optional(),
  variance: z.number().optional(),
  min: z.union([z.number(), z.string()]).optional(),
  max: z.union([z.number(), z.string()]).optional(),
  range: z.number().optional(),
  count: z.number(),
  nullCount: z.number(),
  uniqueCount: z.number(),
});

export type Statistics = z.infer<typeof statisticsSchema>;

// Summary stats for dashboard
export const summaryStatsSchema = z.object({
  totalRecords: z.number(),
  totalColumns: z.number(),
  numericColumns: z.number(),
  textColumns: z.number(),
  missingValues: z.number(),
  dataQuality: z.number(), // Percentage
});

export type SummaryStats = z.infer<typeof summaryStatsSchema>;
