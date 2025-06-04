import * as XLSX from "xlsx";
import type { BoxInput, PlacedBox } from "../PackingLogic";

interface Container {
  length: number;
  width: number;
  height: number;
}

export function exportPackingResultsToExcel(
  container: Container,
  items: BoxInput[],
  packedBoxes: PlacedBox[]
) {
  if (packedBoxes.length === 0) {
    alert("No boxes packed yet.");
    return;
  }

  const containerSheet = [
    {
      Length: container.length,
      Width: container.width,
      Height: container.height,
    },
  ];

  const itemsSheet = items.map((item, idx) => ({
    Item: idx + 1,
    Length: item.length,
    Width: item.width,
    Height: item.height,
    Quantity: item.quantity,
  }));

  const packedBoxesSheet = packedBoxes.map((box, idx) => ({
    Box: idx + 1,
    Length: box.length,
    Width: box.width,
    Height: box.height,
    X: box.x,
    Y: box.y,
    Z: box.z,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(containerSheet),
    "Container"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(itemsSheet),
    "Items"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(packedBoxesSheet),
    "PackedBoxes"
  );

  XLSX.writeFile(wb, "packing-results.xlsx");
}
