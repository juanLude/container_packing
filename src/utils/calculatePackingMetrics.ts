import type { PlacedBox } from "../PackingLogic";

export function calculatePackingMetrics(
  container: { length: number; width: number; height: number },
  placedBoxes: PlacedBox[]
) {
  const containerVolume = container.length * container.width * container.height;

  const usedVolume = placedBoxes.reduce(
    (sum, box) => sum + box.length * box.width * box.height,
    0
  );

  const utilization = (usedVolume / containerVolume) * 100;

  return {
    containerVolume,
    usedVolume,
    utilization: Math.round(utilization * 100) / 100, // rounded to 2 decimals
  };
}
