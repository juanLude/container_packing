// src/utils/exportToJson.ts
import type { BoxInput, PlacedBox } from "../PackingLogic";

interface Container {
  length: number;
  width: number;
  height: number;
}
// This function exports the packing results to a JSON file. Triggers a file download in the browser
export function exportPackingResultsToJson(
  container: Container,
  items: BoxInput[],
  packedBoxes: PlacedBox[]
) {
  if (packedBoxes.length === 0) {
    alert("No boxes packed yet.");
    return;
  }

  const exportData = {
    container,
    items,
    packedBoxes,
  };
  // Create a Blob from the export data
  // and trigger a download as a JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  // Create a URL for the Blob and create a link to download it
  const url = URL.createObjectURL(blob);
  // Create an anchor element and trigger a download
  const a = document.createElement("a");
  // Set the href to the Blob URL and specify the download filename
  a.href = url;
  // Set the download attribute to specify the filename
  a.download = "packing-results.json";
  // Programmatically click the anchor to trigger the download
  a.click();
  // Clean up by revoking the Blob URL
  URL.revokeObjectURL(url);
}
