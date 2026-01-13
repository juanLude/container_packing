// src/components/ExportDropdown.tsx
import { useState } from "react";
import type { BoxInput, PlacedBox } from "../PackingLogic";
import { exportPackingResultsToJson } from "../utils/exportToJson";
// import { exportPackingResultsToExcel } from "../utils/exportToExcel";

interface Props {
  container: {
    length: number;
    width: number;
    height: number;
  };
  items: BoxInput[];
  packedBoxes: PlacedBox[];
}

export default function ExportDropdown({
  container,
  items,
  packedBoxes,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: "json" | "excel") => {
    if (packedBoxes.length === 0) {
      alert("No boxes packed yet.");
      return;
    }

    if (format === "json") {
      exportPackingResultsToJson(container, items, packedBoxes);
    } else {
      // exportPackingResultsToExcel(container, items, packedBoxes);
    }

    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-700 text-white px-4 py-2 rounded"
      >
        Export Results
      </button>

      {open && (
        <div className="absolute mt-2 bg-white border shadow rounded z-10">
          <button
            onClick={() => handleExport("json")}
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            Export as JSON
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            Export as Excel
          </button>
        </div>
      )}
    </div>
  );
}
