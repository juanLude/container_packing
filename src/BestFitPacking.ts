import type { BoxInput, PackingResult, PlacedBox } from "./PackingLogic";

interface Space {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
}

const rotateBox = (box: BoxInput) => {
  const rotations: [number, number, number][] = [
    [box.length, box.width, box.height],
    [box.length, box.height, box.width],
    [box.width, box.length, box.height],
    [box.width, box.height, box.length],
    [box.height, box.length, box.width],
    [box.height, box.width, box.length],
  ];
  return rotations;
};

export function calculateBestFitPacking(
  container: { length: number; width: number; height: number },
  items: BoxInput[]
): PackingResult {
  const placedBoxes: PlacedBox[] = [];
  const unplacedBoxes: BoxInput[] = [];
  let spaces: Space[] = [
    {
      x: 0,
      y: 0,
      z: 0,
      length: container.length,
      width: container.width,
      height: container.height,
    },
  ];

  const allBoxes: BoxInput[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      allBoxes.push({ ...item, quantity: 1 });
    }
  }

  // Sort boxes by volume descending (biggest first)
  allBoxes.sort((a, b) => {
    const volA = a.length * a.width * a.height;
    const volB = b.length * b.width * b.height;
    return volB - volA;
  });

  for (const box of allBoxes) {
    let bestFit: { space: Space; dims: [number, number, number] } | null = null;
    let bestScore = Infinity;

    const rotations = rotateBox(box);

    // Sort spaces by volume ascending (tightest first)
    spaces.sort(
      (a, b) => a.length * a.width * a.height - b.length * b.width * b.height
    );

    for (const space of spaces) {
      for (const [l, w, h] of rotations) {
        if (l <= space.length && w <= space.width && h <= space.height) {
          const waste = space.length * space.width * space.height - l * w * h;
          const surfaceArea = l * w + w * h + h * l;
          const score = waste + surfaceArea * 0.1; // Adjust the 0.1 weight as needed

          if (score < bestScore) {
            bestScore = score;
            bestFit = { space, dims: [l, w, h] };
          }
        }
      }
    }

    if (bestFit) {
      const { space, dims } = bestFit;
      const [l, w, h] = dims;

      placedBoxes.push({
        length: l,
        width: w,
        height: h,
        x: space.x,
        y: space.y,
        z: space.z,
        color: box.color || getRandomColor(),
      });

      const { x, y, z } = space;
      const newSpaces: Space[] = [];

      // Only split along the 3 axes
      if (space.length > l) {
        newSpaces.push({
          x: x + l,
          y,
          z,
          length: space.length - l,
          width: space.width,
          height: space.height,
        });
      }
      if (space.width > w) {
        newSpaces.push({
          x,
          y: y + w,
          z,
          length: space.length,
          width: space.width - w,
          height: space.height,
        });
      }
      if (space.height > h) {
        newSpaces.push({
          x,
          y,
          z: z + h,
          length: space.length,
          width: space.width,
          height: space.height - h,
        });
      }

      // Optional corner cuts (to reduce dead space)
      if (space.length > l && space.width > w) {
        newSpaces.push({
          x: x + l,
          y: y + w,
          z,
          length: space.length - l,
          width: space.width - w,
          height: h,
        });
      }
      if (space.length > l && space.height > h) {
        newSpaces.push({
          x: x + l,
          y,
          z: z + h,
          length: space.length - l,
          width: w,
          height: space.height - h,
        });
      }
      if (space.width > w && space.height > h) {
        newSpaces.push({
          x,
          y: y + w,
          z: z + h,
          length: l,
          width: space.width - w,
          height: space.height - h,
        });
      }

      // Remove used space and add the new fragments
      spaces = spaces.filter((s) => s !== space).concat(newSpaces);
    } else {
      unplacedBoxes.push(box);
    }
  }

  return { placedBoxes, unplacedBoxes };
}

function getRandomColor() {
  const colors = [
    "#f87171",
    "#60a5fa",
    "#34d399",
    "#facc15",
    "#a78bfa",
    "#8b5cf6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
