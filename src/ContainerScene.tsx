// src/ContainerScene.tsx

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface Container {
  length: number;
  width: number;
  height: number;
}

interface Box {
  length: number;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function ContainerScene({
  container,
  boxes,
}: {
  container: Container;
  boxes: Box[];
}) {
  return (
    <div className="h-[500px] border rounded bg-gray-100">
      <Canvas
        camera={{
          position: [container.length, container.width, container.height],
          fov: 50,
        }}
      >
        <ambientLight />
        <pointLight position={[100, 100, 100]} />
        <OrbitControls />

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
        {boxes.map((box, idx) => (
          <mesh
            key={idx}
            position={[
              box.x + box.length / 2,
              box.z + box.height / 2,
              box.y + box.width / 2,
            ]}
          >
            <boxGeometry args={[box.length, box.height, box.width]} />
            <meshStandardMaterial color={box.color} />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
}
