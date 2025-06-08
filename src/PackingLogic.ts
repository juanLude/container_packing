// This file contains the packing logic for the box packing application.
// It calculates the placement of boxes within a container based on their dimensions and quantity.
// This interface defines the structure of a box input, including its dimensions and quantity.

// The PlacedBox interface defines the structure of a box after it has been placed in the container,
// including its position (x, y, z coordinates) and color.

export interface BoxInput {
  length: number; // Length of the box
  width: number; // Width of the box
  height: number; // Height of the box
  quantity: number; // Quantity of boxes to be packed
  color?: string; // Optional color property for the box
}

export interface PlacedBox {
  length: number; // Length of the box
  width: number; // Width of the box
  height: number; // Height of the box
  x: number; // X coordinate of the box in the container
  y: number; // Y coordinate of the box in the container
  z: number; // Z coordinate of the box in the container
  color: string; // Color of the box
}

export interface PackingResult {
  placedBoxes: PlacedBox[];
  unplacedBoxes: BoxInput[]; // Same structure as input so we can show what didn't fit
}

// The calculatePacking function takes a container's dimensions and an array of BoxInput objects,
// and returns an array of PlacedBox objects representing the packed boxes.
export function calculatePacking(
  container: { length: number; width: number; height: number },
  items: BoxInput[]
): PackingResult {
  const placedBoxes: PlacedBox[] = [];
  const unplacedMap: Record<string, BoxInput> = {};

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
        }
      }

      if (
        x + item.length <= container.length &&
        y + item.width <= container.width &&
        z + item.height <= container.height
      ) {
        placedBoxes.push({
          length: item.length,
          width: item.width,
          height: item.height,
          x,
          y,
          z,
          color: item.color || getRandomColor(),
        });
        x += item.length;
      } else {
        const key = `${item.length}x${item.width}x${item.height}`;
        if (!unplacedMap[key]) {
          unplacedMap[key] = { ...item, quantity: 0 };
        }
        unplacedMap[key].quantity++;
      }
    }
  }

  const unplacedBoxes = Object.values(unplacedMap);

  return { placedBoxes, unplacedBoxes };
}

function getRandomColor() {
  const colors = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];
  return colors[Math.floor(Math.random() * colors.length)];
}
