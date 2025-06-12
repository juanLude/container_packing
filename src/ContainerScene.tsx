// src/ContainerScene.tsx

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

// This file defines the 3D scene for visualizing the container and packed boxes.
interface Container {
  length: number;
  width: number;
  height: number;
}
// This interface defines the structure of a box with its dimensions and position in 3D space.
interface Box {
  length: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  color: string;
}
// This component renders a 3D scene with a container and packed boxes using React Three Fiber.
// It uses the Canvas component to create a 3D canvas and OrbitControls for camera movement.
// The container is represented as a wireframe box, and each packed box is rendered with its respective dimensions and color.
export default function ContainerScene({
  container,
  boxes,
  unplacedBoxes = [],
}: {
  container: Container;
  boxes: Box[];
  unplacedBoxes?: {
    length: number;
    width: number;
    height: number;
    quantity: number;
    color?: string;
  }[];
}) {
  return (
    <div className="w-full min-h-[800px] border rounded bg-gray-100">
      <Canvas
        style={{ background: "#f0f0f0", width: "100%", height: "700px" }}
        camera={{
          position: [
            container.length / 10,
            container.width / 10,
            container.height / 10,
          ], // Set initial camera position based on container dimensions
          fov: 50, // Field of view for the camera
        }}
      >
        <ambientLight /> // Ambient light to illuminate the scene
        <pointLight position={[100, 100, 100]} /> // Point light to add depth
        and shadows
        <OrbitControls /> // Controls for orbiting around the scene
        {/* Container Outline */}
        <mesh
          position={[
            container.length / 2,
            container.height / 2,
            container.width / 2,
          ]}
        >
          <boxGeometry
            args={[container.length, container.height, container.width]}
          />
          <meshBasicMaterial color="white" wireframe />
        </mesh>
        {/* Packed Boxes */}
        // Iterate over the boxes array to render each box in the scene
        {boxes.map((box, idx) => (
          <mesh
            key={idx}
            position={[
              box.x + box.length / 2,
              box.z + box.height / 2,
              box.y + box.width / 2,
            ]}
          >
            <boxGeometry args={[box.length, box.height, box.width]} /> // Create
            a box geometry with the specified dimensions
            <meshStandardMaterial color={box.color} /> // Use a standard
            material for the box with the specified color
            {/* <Html center>
              <div
                style={{
                  fontSize: "10px",
                  // background: "white",
                  padding: "2px",
                  borderRadius: "4px",
                }}
              >
                {box.length}×{box.width}×{box.height}
              </div>
            </Html> */}
          </mesh>
        ))}
        {/* Unplaced Boxes */}
        {unplacedBoxes.flatMap((box, boxIdx) =>
          Array.from({ length: box.quantity }).map((_, i) => {
            const margin = 2;
            const columns = 5; // how many boxes per row
            const spacingX = box.length + margin;
            const spacingZ = box.width + margin;

            const globalIndex =
              unplacedBoxes
                .slice(0, boxIdx)
                .reduce((sum, b) => sum + b.quantity, 0) + i;

            const col = globalIndex % columns;
            const row = Math.floor(globalIndex / columns);

            const offsetX = container.length + 2.5 + col * spacingX;
            const offsetY = box.height / 2;
            const offsetZ = row * spacingZ; //

            return (
              <mesh
                key={`unplaced-${boxIdx}-${i}`}
                position={[offsetX, offsetY, offsetZ + box.width / 2]}
              >
                <boxGeometry args={[box.length, box.height, box.width]} />
                <meshStandardMaterial
                  color={box.color || "red"}
                  opacity={0.5}
                  transparent
                />
                <Html center>
                  <div
                    style={{
                      fontSize: "10px",
                      // background: "white",
                      padding: "2px",
                      borderRadius: "4px",
                    }}
                  >
                    {box.length}×{box.width}×{box.height}
                  </div>
                </Html>
              </mesh>
            );
          })
        )}
      </Canvas>
    </div>
  );
}
