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

  for (const box of allBoxes) {
    let bestFit: { space: Space; dims: [number, number, number] } | null = null;
    let minWaste = Infinity;

    const rotations = rotateBox(box);

    for (const space of spaces) {
      for (const [l, w, h] of rotations) {
        if (l <= space.length && w <= space.width && h <= space.height) {
          const waste = space.length * space.width * space.height - l * w * h;
          if (waste < minWaste) {
            minWaste = waste;
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

      // Subdivide space
      const newSpaces: Space[] = [];

      const dx = space.length - l;
      const dy = space.width - w;
      const dz = space.height - h;

      if (dx > 0) {
        newSpaces.push({
          x: space.x + l,
          y: space.y,
          z: space.z,
          length: dx,
          width: w,
          height: h,
        });
      }
      if (dy > 0) {
        newSpaces.push({
          x: space.x,
          y: space.y + w,
          z: space.z,
          length: l,
          width: dy,
          height: h,
        });
      }
      if (dz > 0) {
        newSpaces.push({
          x: space.x,
          y: space.y,
          z: space.z + h,
          length: l,
          width: w,
          height: dz,
        });
      }

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
