// src/components/ExcelImport.tsx
import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Box } from "../algorithms/types";

interface ExcelImportProps {
  onImport: (boxes: Box[]) => void;
}

interface ParsedRow {
  // Allow for different casing and naming conventions
  [key: string]: string | number | boolean | null | undefined;
  name?: string;
  Name?: string;
  id?: string;
  ID?: string;
  length?: number;
  Length?: number;
  l?: number;
  L?: number;
  x?: number;
  X?: number;
  width?: number;
  Width?: number;
  w?: number;
  W?: number;
  y?: number;
  Y?: number;
  height?: number;
  Height?: number;
  h?: number;
  H?: number;
  z?: number;
  Z?: number;
  weight?: number;
  Weight?: number;
  kg?: number;
  KG?: number;
  fragile?: string | boolean;
  Fragile?: string | boolean;
  stackable?: string | boolean;
  Stackable?: string | boolean;
  priority?: number;
  Priority?: number;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateBoxId = () => {
    return `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const parseExcelFile = async (file: File): Promise<Box[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON with header row
          const jsonData: ParsedRow[] = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: null,
          });

          if (jsonData.length === 0) {
            reject(new Error("The Excel file is empty"));
            return;
          }

          const boxes: Box[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, index) => {
            try {
              // Try to find dimensions in different possible column names
              const length = parseFloat(
                String(
                  row.length ||
                    row.Length ||
                    row.l ||
                    row.L ||
                    row.x ||
                    row.X ||
                    "0"
                )
              );
              const width = parseFloat(
                String(
                  row.width ||
                    row.Width ||
                    row.w ||
                    row.W ||
                    row.y ||
                    row.Y ||
                    "0"
                )
              );
              const height = parseFloat(
                String(
                  row.height ||
                    row.Height ||
                    row.h ||
                    row.H ||
                    row.z ||
                    row.Z ||
                    "0"
                )
              );
              const weight = parseFloat(
                String(row.weight || row.Weight || row.kg || row.KG || "0")
              );

              // Validate required fields
              if (
                !length ||
                !width ||
                !height ||
                !weight ||
                isNaN(length) ||
                isNaN(width) ||
                isNaN(height) ||
                isNaN(weight)
              ) {
                errors.push(
                  `Row ${index + 2}: Missing or invalid dimensions/weight`
                );
                return;
              }

              if (length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
                errors.push(
                  `Row ${
                    index + 2
                  }: Dimensions and weight must be positive numbers`
                );
                return;
              }

              // Parse optional fields
              const name = String(
                row.name || row.Name || row.id || row.ID || `Box ${index + 1}`
              );

              const fragile =
                String(row.fragile || row.Fragile || "false").toLowerCase() ===
                  "true" ||
                String(row.fragile || row.Fragile || "false").toLowerCase() ===
                  "yes";

              const stackable =
                String(
                  row.stackable || row.Stackable || "true"
                ).toLowerCase() !== "false" &&
                String(
                  row.stackable || row.Stackable || "true"
                ).toLowerCase() !== "no";

              const priority =
                parseInt(String(row.priority || row.Priority || "0")) || 0;

              const box: Box = {
                id: generateBoxId(),
                name,
                dimensions: {
                  x: length,
                  y: height,
                  z: width,
                },
                weight,
                fragile,
                stackable,
                priority,
              };

              boxes.push(box);
            } catch (err) {
              errors.push(
                `Row ${index + 2}: ${
                  err instanceof Error ? err.message : "Unknown error"
                }`
              );
            }
          });

          if (boxes.length === 0) {
            reject(
              new Error(`No valid boxes found. Errors: ${errors.join(", ")}`)
            );
            return;
          }

          if (errors.length > 0) {
            console.warn("Some rows had errors:", errors);
          }

          resolve(boxes);
        } catch (err) {
          reject(
            new Error(
              `Failed to parse Excel file: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setIsProcessing(true);

    try {
      const boxes = await parseExcelFile(file);
      onImport(boxes);
      setSuccess(
        `Successfully imported ${boxes.length} box${
          boxes.length > 1 ? "es" : ""
        }`
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        name: "Box 1",
        length: 100,
        width: 80,
        height: 60,
        weight: 25,
        fragile: "false",
        stackable: "true",
        priority: 1,
      },
      {
        name: "Box 2",
        length: 120,
        width: 90,
        height: 70,
        weight: 30,
        fragile: "true",
        stackable: "false",
        priority: 2,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Boxes");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 15 }, // name
      { wch: 10 }, // length
      { wch: 10 }, // width
      { wch: 10 }, // height
      { wch: 10 }, // weight
      { wch: 10 }, // fragile
      { wch: 10 }, // stackable
      { wch: 10 }, // priority
    ];

    XLSX.writeFile(workbook, "box-import-template.xlsx");
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import from Excel
        </h3>
        <button
          onClick={downloadTemplate}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
        >
          Download Template
        </button>
      </div>

      {/* Drag and Drop Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-blue-400 bg-blue-900/20"
              : "border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700"
          }
          ${isProcessing ? "opacity-50 cursor-wait" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${
            isDragging ? "text-blue-400" : "text-slate-400"
          }`}
        />

        <p className="text-white font-medium mb-2">
          {isDragging
            ? "Drop your Excel file here"
            : "Click or drag Excel file to upload"}
        </p>
        <p className="text-slate-400 text-sm">Supports .xlsx and .xls files</p>

        {isProcessing && (
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <p className="text-white text-sm mt-2">Processing file...</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-200 text-sm font-medium">Import Error</p>
            <p className="text-red-300 text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-200 text-sm font-medium">
              Import Successful
            </p>
            <p className="text-green-300 text-xs mt-1">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Format Guide */}
      <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
        <p className="text-white text-sm font-medium mb-2">Expected Columns:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>name</strong>{" "}
            (optional)
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>length</strong>{" "}
            (cm) *
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>width</strong> (cm)
            *
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>height</strong>{" "}
            (cm) *
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>weight</strong>{" "}
            (kg) *
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>fragile</strong>{" "}
            (true/false)
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>stackable</strong>{" "}
            (true/false)
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">•</span> <strong>priority</strong>{" "}
            (number)
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-3">* Required fields</p>
      </div>
    </div>
  );
};

export default ExcelImport;
