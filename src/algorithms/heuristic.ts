import {
  Box,
  Container,
  PackingResult,
  PlacedBox,
  Space,
  Position,
  //Dimensions,
  PackingOptions,
} from "./types";

/**
 * Heuristic packing algorithm using First-Fit Decreasing with bottom-left strategy
 */
export function heuristicPacking(
  boxes: Box[],
  container: Container,
  options: PackingOptions = { algorithm: "heuristic" }
): PackingResult {
  const startTime = performance.now();
  const packedBoxes: PlacedBox[] = [];
  const unpackedBoxes: Box[] = [];

  // Sort boxes by volume (largest first)
  const sortedBoxes = [...boxes].sort((a, b) => {
    const volA = a.dimensions.x * a.dimensions.y * a.dimensions.z;
    const volB = b.dimensions.x * b.dimensions.y * b.dimensions.z;
    return volB - volA;
  });

  // Initialize available spaces (starting with the full container)
  const spaces: Space[] = [
    {
      position: { x: 0, y: 0, z: 0 },
      dimensions: container.dimensions,
      maxWeight: container.maxWeight,
    },
  ];

  let currentWeight = 0;

  for (const box of sortedBoxes) {
    let placed = false;

    // Try to place box in available spaces
    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i];

      // Check if box fits in this space
      const fits = boxFitsInSpace(box, space);

      if (fits && currentWeight + box.weight <= container.maxWeight) {
        // Check weight constraints
        if (
          options.respectStackability &&
          !canPlaceBox(box, space, packedBoxes)
        ) {
          continue;
        }

        // Place the box
        const placedBox: PlacedBox = {
          ...box,
          position: space.position,
        };

        packedBoxes.push(placedBox);
        currentWeight += box.weight;

        // Update available spaces
        spaces.splice(i, 1);
        const newSpaces = generateNewSpaces(placedBox, space, container);
        spaces.push(...newSpaces);

        // Sort spaces by position (bottom-left first)
        spaces.sort((a, b) => {
          if (a.position.y !== b.position.y) return a.position.y - b.position.y;
          if (a.position.z !== b.position.z) return a.position.z - b.position.z;
          return a.position.x - b.position.x;
        });

        placed = true;
        break;
      }
    }

    if (!placed) {
      unpackedBoxes.push(box);
    }
  }

  const endTime = performance.now();
  const packingTime = endTime - startTime;

  // Calculate metrics
  const volumeUtilization = calculateVolumeUtilization(packedBoxes, container);
  const weightUtilization = (currentWeight / container.maxWeight) * 100;
  const centerOfGravity = calculateCenterOfGravity(packedBoxes);
  const isStable = checkStability(packedBoxes, centerOfGravity, container);

  return {
    container,
    packedBoxes,
    unpackedBoxes,
    utilization: volumeUtilization,
    volumeUtilization,
    weightUtilization,
    totalWeight: currentWeight,
    centerOfGravity,
    isStable,
    packingTime,
    levels: calculateLevels(packedBoxes),
  };
}

function boxFitsInSpace(box: Box, space: Space): boolean {
  return (
    box.dimensions.x <= space.dimensions.x &&
    box.dimensions.y <= space.dimensions.y &&
    box.dimensions.z <= space.dimensions.z
  );
}

function canPlaceBox(
  box: Box,
  space: Space,
  placedBoxes: PlacedBox[]
): boolean {
  // Check if there's support below (not floating)
  if (space.position.y === 0) return true; // On ground level

  const boxBottom = space.position.y;
  let hasSupport = false;

  for (const placed of placedBoxes) {
    const placedTop = placed.position.y + placed.dimensions.y;

    // Check if this box is directly below
    if (Math.abs(placedTop - boxBottom) < 0.01) {
      // Check if there's overlap in x and z
      const xOverlap =
        space.position.x < placed.position.x + placed.dimensions.x &&
        space.position.x + box.dimensions.x > placed.position.x;

      const zOverlap =
        space.position.z < placed.position.z + placed.dimensions.z &&
        space.position.z + box.dimensions.z > placed.position.z;

      if (xOverlap && zOverlap) {
        // Check stacking constraints
        if (placed.stackable === false) return false;
        if (placed.maxStackWeight && placed.maxStackWeight < box.weight)
          return false;
        if (box.fragile && placed.weight > box.weight * 0.5) return false;

        hasSupport = true;
      }
    }
  }

  return hasSupport;
}

function generateNewSpaces(
  placedBox: PlacedBox,
  usedSpace: Space,
  container: Container
): Space[] {
  const newSpaces: Space[] = [];
  const { position, dimensions } = placedBox;

  // Space above the placed box
  if (position.y + dimensions.y < container.dimensions.y) {
    newSpaces.push({
      position: {
        x: position.x,
        y: position.y + dimensions.y,
        z: position.z,
      },
      dimensions: {
        x: dimensions.x,
        y: container.dimensions.y - (position.y + dimensions.y),
        z: dimensions.z,
      },
    });
  }

  // Space to the right
  if (
    position.x + dimensions.x <
    usedSpace.position.x + usedSpace.dimensions.x
  ) {
    newSpaces.push({
      position: {
        x: position.x + dimensions.x,
        y: position.y,
        z: position.z,
      },
      dimensions: {
        x:
          usedSpace.position.x +
          usedSpace.dimensions.x -
          (position.x + dimensions.x),
        y: usedSpace.dimensions.y,
        z: dimensions.z,
      },
    });
  }

  // Space to the back
  if (
    position.z + dimensions.z <
    usedSpace.position.z + usedSpace.dimensions.z
  ) {
    newSpaces.push({
      position: {
        x: position.x,
        y: position.y,
        z: position.z + dimensions.z,
      },
      dimensions: {
        x: dimensions.x,
        y: usedSpace.dimensions.y,
        z:
          usedSpace.position.z +
          usedSpace.dimensions.z -
          (position.z + dimensions.z),
      },
    });
  }

  return newSpaces;
}

function calculateVolumeUtilization(
  boxes: PlacedBox[],
  container: Container
): number {
  const totalBoxVolume = boxes.reduce(
    (sum, box) => sum + box.dimensions.x * box.dimensions.y * box.dimensions.z,
    0
  );
  const containerVolume =
    container.dimensions.x * container.dimensions.y * container.dimensions.z;
  return (totalBoxVolume / containerVolume) * 100;
}

function calculateCenterOfGravity(boxes: PlacedBox[]): Position {
  if (boxes.length === 0) return { x: 0, y: 0, z: 0 };

  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

  for (const box of boxes) {
    const centerX = box.position.x + box.dimensions.x / 2;
    const centerY = box.position.y + box.dimensions.y / 2;
    const centerZ = box.position.z + box.dimensions.z / 2;

    weightedX += centerX * box.weight;
    weightedY += centerY * box.weight;
    weightedZ += centerZ * box.weight;
    totalWeight += box.weight;
  }

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
    z: weightedZ / totalWeight,
  };
}

function checkStability(
  boxes: PlacedBox[],
  cog: Position,
  container: Container
): boolean {
  // Check if center of gravity is within safe bounds
  const baseX = container.dimensions.x / 2;
  const baseZ = container.dimensions.z / 2;
  const tolerance =
    Math.min(container.dimensions.x, container.dimensions.z) * 0.15;

  const xDeviation = Math.abs(cog.x - baseX);
  const zDeviation = Math.abs(cog.z - baseZ);

  return xDeviation < tolerance && zDeviation < tolerance;
}

function calculateLevels(boxes: PlacedBox[]): number {
  if (boxes.length === 0) return 0;

  const maxY = Math.max(...boxes.map((b) => b.position.y + b.dimensions.y));
  const minHeight = Math.min(...boxes.map((b) => b.dimensions.y));

  return Math.ceil(maxY / minHeight);
}
