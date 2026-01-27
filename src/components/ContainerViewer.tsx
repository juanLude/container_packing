import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box as ThreeBox, Text } from "@react-three/drei";
import { PackingResult, PlacedBox } from "../algorithms/types";
import { useState, useMemo } from "react";

interface ContainerViewerProps {
  result: PackingResult;
}

export default function ContainerViewer({ result }: ContainerViewerProps) {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const { container, packedBoxes } = result;

  // Scale factor for better visualization (convert cm to units)
  const scale = 0.01;

  // Calculate dimensions in scaled units
  const containerWidth = container.dimensions.x * scale;
  const containerHeight = container.dimensions.y * scale;
  const containerDepth = container.dimensions.z * scale;

  // Calculate optimal camera distance based on container size
  const maxDimension = Math.max(
    containerWidth,
    containerHeight,
    containerDepth,
  );
  const cameraDistance = maxDimension * 1.5;

  // Calculate ground plane size (should be larger than container)
  const groundSize = Math.max(containerWidth, containerDepth) * 2.5;

  return (
    <Canvas
      camera={{
        position: [cameraDistance, cameraDistance * 0.75, cameraDistance],
        fov: 50,
      }}
      style={{ background: "#0f172a" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={maxDimension * 0.5}
        maxDistance={maxDimension * 3}
      />

      {/* Container outline */}
      <ContainerOutline dimensions={container.dimensions} scale={scale} />

      {/* Ground plane - dynamically sized */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Grid helper - dynamically sized */}
      <gridHelper
        args={[
          groundSize,
          Math.max(10, Math.floor(groundSize / 2)),
          "#555555",
          "#333333",
        ]}
        position={[0, 0.01, 0]}
      />

      {/* Packed boxes */}
      {packedBoxes.map((box) => (
        <PackedBoxMesh
          key={box.id}
          box={box}
          scale={scale}
          isSelected={selectedBox === box.id}
          onSelect={() =>
            setSelectedBox(box.id === selectedBox ? null : box.id)
          }
        />
      ))}

      {/* Center of gravity indicator */}
      <CenterOfGravityMarker position={result.centerOfGravity} scale={scale} />
    </Canvas>
  );
}

interface ContainerOutlineProps {
  dimensions: { x: number; y: number; z: number };
  scale: number;
}

function ContainerOutline({ dimensions, scale }: ContainerOutlineProps) {
  const width = dimensions.x * scale;
  const height = dimensions.y * scale;
  const depth = dimensions.z * scale;

  return (
    <group position={[width / 2, height / 2, depth / 2]}>
      <ThreeBox args={[width, height, depth]}>
        <meshBasicMaterial
          color="#64748b"
          wireframe
          transparent
          opacity={0.3}
        />
      </ThreeBox>
    </group>
  );
}

interface PackedBoxMeshProps {
  box: PlacedBox;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
}

function PackedBoxMesh({
  box,
  scale,
  isSelected,
  onSelect,
}: PackedBoxMeshProps) {
  const width = box.dimensions.x * scale;
  const height = box.dimensions.y * scale;
  const depth = box.dimensions.z * scale;

  const x = (box.position.x + box.dimensions.x / 2) * scale;
  const y = (box.position.y + box.dimensions.y / 2) * scale;
  const z = (box.position.z + box.dimensions.z / 2) * scale;

  // Color based on properties
  let color = box.color || "#3b82f6";
  if (box.fragile) {
    color = "#ef4444"; // red for fragile
  } else if (!box.stackable) {
    color = "#f59e0b"; // amber for non-stackable
  }

  return (
    <group position={[x, y, z]}>
      <ThreeBox
        args={[width, height, depth]}
        onClick={onSelect}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <meshStandardMaterial
          color={isSelected ? "#fbbf24" : color}
          transparent
          opacity={isSelected ? 1 : 0.8}
          emissive={isSelected ? "#fbbf24" : undefined}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </ThreeBox>

      {/* Edges for better visibility */}
      <ThreeBox args={[width, height, depth]}>
        <meshBasicMaterial
          color={isSelected ? "#ffffff" : "#1e293b"}
          wireframe
          transparent
          opacity={isSelected ? 0.8 : 0.2}
        />
      </ThreeBox>

      {/* Label for selected box */}
      {isSelected && (
        <Text
          position={[0, height / 2 + 0.3, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {box.name || box.id}
          {"\n"}
          {`${box.dimensions.x}×${box.dimensions.y}×${box.dimensions.z} cm`}
          {"\n"}
          {`${box.weight} kg`}
        </Text>
      )}
    </group>
  );
}

interface CenterOfGravityMarkerProps {
  position: { x: number; y: number; z: number };
  scale: number;
}

function CenterOfGravityMarker({
  position,
  scale,
}: CenterOfGravityMarkerProps) {
  const x = position.x * scale;
  const y = position.y * scale;
  const z = position.z * scale;

  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        CoG
      </Text>
    </group>
  );
}
