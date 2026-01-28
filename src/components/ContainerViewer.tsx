import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box as ThreeBox, Text } from "@react-three/drei";
import { PackingResult, PlacedBox, Box } from "../algorithms/types";
import { useState, useMemo } from "react";

interface ContainerViewerProps {
  result: PackingResult;
}

// Interfaz para cajas apiladas (sin empacar)
interface StackedBox extends Box {
  stackPosition: { x: number; y: number; z: number };
}

// Función para calcular el apilamiento de cajas no empacadas
function stackUnpackedBoxes(
  unpackedBoxes: Box[],
  containerDims: { x: number; y: number; z: number },
  scale: number,
): StackedBox[] {
  const stackedBoxes: StackedBox[] = [];

  // Posición del rincón (esquina trasera derecha del contenedor)
  const cornerX = containerDims.x * scale + 2; // 2 unidades de separación
  const cornerZ = containerDims.z * scale + 2;

  let currentX = cornerX;
  let currentY = 0;
  let currentZ = cornerZ;
  let rowMaxHeight = 0;
  let layerMaxDepth = 0;

  const maxRowWidth = 8; // Ancho máximo del área de apilamiento

  for (const box of unpackedBoxes) {
    const boxWidth = box.dimensions.x * scale;
    const boxHeight = box.dimensions.y * scale;
    const boxDepth = box.dimensions.z * scale;

    // Si no cabe en la fila actual, pasar a la siguiente fila
    if (currentX + boxWidth - cornerX > maxRowWidth) {
      currentX = cornerX;
      currentZ += layerMaxDepth;
      layerMaxDepth = 0;

      // Si no cabe en profundidad, subir un nivel
      if (currentZ + boxDepth - cornerZ > maxRowWidth) {
        currentZ = cornerZ;
        currentY += rowMaxHeight;
        rowMaxHeight = 0;
      }
    }

    stackedBoxes.push({
      ...box,
      stackPosition: {
        x: currentX + boxWidth / 2,
        y: currentY + boxHeight / 2,
        z: currentZ + boxDepth / 2,
      },
    });

    currentX += boxWidth;
    rowMaxHeight = Math.max(rowMaxHeight, boxHeight);
    layerMaxDepth = Math.max(layerMaxDepth, boxDepth);
  }

  return stackedBoxes;
}

export default function ContainerViewer({ result }: ContainerViewerProps) {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const { container, packedBoxes, unpackedBoxes } = result;

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

  // Calculate ground plane size (debe ser más grande para incluir área de cajas no empacadas)
  const groundSize = Math.max(containerWidth, containerDepth) * 3.5;

  // Calcular cajas no empacadas apiladas
  const stackedUnpackedBoxes = useMemo(
    () => stackUnpackedBoxes(unpackedBoxes || [], container.dimensions, scale),
    [unpackedBoxes, container.dimensions, scale],
  );

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
        maxDistance={maxDimension * 4}
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

      {/* Packed boxes (inside container) */}
      {packedBoxes.map((box) => (
        <PackedBoxMesh
          key={box.id}
          box={box}
          scale={scale}
          isSelected={selectedBox === box.id}
          onSelect={() =>
            setSelectedBox(box.id === selectedBox ? null : box.id)
          }
          isPacked={true}
        />
      ))}

      {/* Unpacked boxes (stacked in corner) */}
      {stackedUnpackedBoxes.map((box) => (
        <UnpackedBoxMesh
          key={box.id}
          box={box}
          scale={scale}
          isSelected={selectedBox === box.id}
          onSelect={() =>
            setSelectedBox(box.id === selectedBox ? null : box.id)
          }
        />
      ))}

      {/* Label for unpacked area */}
      {stackedUnpackedBoxes.length > 0 && (
        <Text
          position={[containerWidth + 2 + 4, 2, containerDepth + 2 + 4]}
          fontSize={0.4}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
        >
          ⚠️ UNPACKED BOXES
          {"\n"}({stackedUnpackedBoxes.length} items)
        </Text>
      )}

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
  isPacked: boolean;
}

function PackedBoxMesh({
  box,
  scale,
  isSelected,
  onSelect,
  isPacked,
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

interface UnpackedBoxMeshProps {
  box: StackedBox;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
}

function UnpackedBoxMesh({
  box,
  scale,
  isSelected,
  onSelect,
}: UnpackedBoxMeshProps) {
  const width = box.dimensions.x * scale;
  const height = box.dimensions.y * scale;
  const depth = box.dimensions.z * scale;

  const { x, y, z } = box.stackPosition;

  // Color más apagado para cajas no empacadas
  let color = box.color || "#3b82f6";
  if (box.fragile) {
    color = "#ef4444";
  } else if (!box.stackable) {
    color = "#f59e0b";
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
          opacity={isSelected ? 0.8 : 0.5} // Más transparente que las empacadas
          emissive={isSelected ? "#fbbf24" : "#ff0000"}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </ThreeBox>

      {/* Bordes rojos para cajas no empacadas */}
      <ThreeBox args={[width, height, depth]}>
        <meshBasicMaterial
          color={isSelected ? "#ffffff" : "#ff0000"}
          wireframe
          transparent
          opacity={isSelected ? 0.8 : 0.6}
        />
      </ThreeBox>

      {/* Label for selected box */}
      {isSelected && (
        <Text
          position={[0, height / 2 + 0.3, 0]}
          fontSize={0.3}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
        >
          ⚠️ NOT PACKED
          {"\n"}
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
