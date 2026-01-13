import { useRef } from "react";
import Papa from "papaparse";
import { Box } from "../algorithms/types";

interface CSVImportProps {
  onImport: (boxes: Box[]) => void;
}

export default function CSVImport({ onImport }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const boxes = parseCSVData(results.data);
          onImport(boxes);
          alert(`Successfully imported ${boxes.length} boxes!`);

          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          alert(
            `Error parsing CSV: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },
      error: (error) => {
        alert(`Error reading file: ${error.message}`);
      },
    });
  };

  const handleDownloadTemplate = () => {
    const template = `name,length,width,height,weight,fragile,stackable
Electronics Box,100,80,60,50,true,true
Heavy Machinery,200,150,120,500,false,false
Fragile Items,80,60,50,20,true,true
Standard Box,100,100,100,100,false,true`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "box-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Import from CSV</h3>

      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded cursor-pointer transition-colors"
          >
            📄 Choose CSV File
          </label>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm py-2 px-4 rounded transition-colors"
        >
          ⬇️ Download Template
        </button>

        <div className="text-xs text-slate-400 bg-slate-700/30 p-3 rounded">
          <div className="font-medium mb-1">CSV Format:</div>
          <code className="text-slate-300">
            name, length, width, height, weight, fragile, stackable
          </code>
          <div className="mt-2">
            <strong>Required fields:</strong> length, width, height, weight
          </div>
          <div className="mt-1">
            <strong>Optional fields:</strong> name, fragile (true/false),
            stackable (true/false)
          </div>
        </div>
      </div>
    </div>
  );
}

function parseCSVData(data: any[]): Box[] {
  const boxes: Box[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Validate required fields
    const length = parseFloat(row.length || row.Length);
    const width = parseFloat(row.width || row.Width);
    const height = parseFloat(row.height || row.Height);
    const weight = parseFloat(row.weight || row.Weight);

    if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(weight)) {
      console.warn(`Skipping invalid row ${i + 1}:`, row);
      continue;
    }

    // Parse optional fields
    const name = row.name || row.Name || undefined;
    const fragile = parseBoolean(row.fragile || row.Fragile);
    const stackable = parseBoolean(row.stackable || row.Stackable, true); // default true

    const box: Box = {
      id: `imported-${Date.now()}-${i}`,
      name,
      dimensions: { x: length, y: height, z: width },
      weight,
      fragile,
      stackable,
      color: generateColor(i),
    };

    boxes.push(box);
  }

  if (boxes.length === 0) {
    throw new Error("No valid boxes found in CSV file");
  }

  return boxes;
}

function parseBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const str = String(value).toLowerCase().trim();
  return str === "true" || str === "1" || str === "yes";
}

function generateColor(index: number): string {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
  ];
  return colors[index % colors.length];
}
