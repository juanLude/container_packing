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

// The calculatePacking function takes a container's dimensions and an array of BoxInput objects,
// and returns an array of PlacedBox objects representing the packed boxes.
export function calculatePacking(
  container: { length: number; width: number; height: number },
  items: BoxInput[] // Array of BoxInput objects representing the boxes to be packed
): PlacedBox[] {
  const placedBoxes: PlacedBox[] = []; // Array to store the packed boxes
  let x = 0, // Current x coordinate in the container
    y = 0,
    z = 0;
  const layerHeight = items[0]?.height ?? 0; // The layerHeight variable is used to know when to go to the next Z layer. It's based on the first box’s height.
  // Iterate through each box type and place them in the container one by one
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      // If the box doesn’t fit on the current row (x-axis), start a new row (y-axis).
      if (x + item.length > container.length) {
        x = 0;
        y += item.width;
        // If the box doesn’t fit on the current column (y-axis), start a new layer (z-axis).
        if (y + item.width > container.width) {
          y = 0;
          z += layerHeight;
          // If the box doesn’t fit on the current layer (z-axis), stop packing nd return the boxes already placed.
          if (z + item.height > container.height) {
            return placedBoxes;
          }
        }
      }
      // Adds the box to the list with its position.
      placedBoxes.push({
        length: item.length,
        width: item.width,
        height: item.height,
        x,
        y,
        z,
        color: getRandomColor(),
      });

      x += item.length; // Move to the next position on the x-axis
    }
  }

  return placedBoxes;
}

function getRandomColor() {
  const colors = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];
  return colors[Math.floor(Math.random() * colors.length)];
}
