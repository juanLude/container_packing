/**
 * Core types for container packing system
 */

export interface Dimensions {
  x: number;
  y: number;
  z: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Box {
  id: string;
  name?: string;
  dimensions: Dimensions;
  weight: number;
  fragile?: boolean;
  stackable?: boolean;
  priority?: number;
  color?: string;
  maxStackWeight?: number; // Maximum weight that can be placed on top
}

export interface PlacedBox extends Box {
  position: Position;
  rotated?: boolean;
}

export interface Container {
  id: string;
  name: string;
  dimensions: Dimensions;
  maxWeight: number;
  maxWeightPerLevel?: number;
}

export interface PackingResult {
  container: Container;
  packedBoxes: PlacedBox[];
  unpackedBoxes: Box[];
  utilization: number;
  volumeUtilization: number;
  weightUtilization: number;
  totalWeight: number;
  centerOfGravity: Position;
  isStable: boolean;
  packingTime: number;
  levels?: number;
}

export interface MultiContainerResult {
  containers: PackingResult[];
  totalUtilization: number;
  totalBoxes: number;
  packedBoxes: number;
  unpackedBoxes: number;
}

export interface Space {
  position: Position;
  dimensions: Dimensions;
  maxWeight?: number;
}

export type AlgorithmType = "heuristic" | "ebAfit" | "bruteForce";

export interface PackingOptions {
  algorithm: AlgorithmType;
  allowRotation?: boolean;
  optimizeForWeight?: boolean;
  respectFragility?: boolean;
  respectStackability?: boolean;
  maxIterations?: number;
}
