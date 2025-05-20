// This file contains the packing logic for the box packing application.
// It calculates the placement of boxes within a container based on their dimensions and quantity.
export interface BoxInput {
  length: number;
  width: number;
  height: number;
  quantity: number;
}

export interface PlacedBox {
  length: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

export function calculatePacking(
  container: { length: number; width: number; height: number },
  items: BoxInput[]
): PlacedBox[] {
  const placedBoxes: PlacedBox[] = [];
  let x = 0,
    y = 0,
    z = 0;
  const layerHeight = items[0]?.height ?? 0;

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      if (x + item.length > container.length) {
        x = 0;
        y += item.width;
        if (y + item.width > container.width) {
          y = 0;
          z += layerHeight;
          if (z + item.height > container.height) {
            return placedBoxes;
          }
        }
      }

      placedBoxes.push({
        length: item.length,
        width: item.width,
        height: item.height,
        x,
        y,
        z,
        color: getRandomColor(),
      });

      x += item.length;
    }
  }

  return placedBoxes;
}

function getRandomColor() {
  const colors = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];
  return colors[Math.floor(Math.random() * colors.length)];
}
