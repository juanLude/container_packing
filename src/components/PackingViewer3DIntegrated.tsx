import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PackingResult } from "../algorithms/types";

interface PackingViewer3DIntegratedProps {
  result: PackingResult;
}

const PackingViewer3DIntegrated: React.FC<PackingViewer3DIntegratedProps> = ({
  result,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boxMeshesRef = useRef<THREE.Mesh[]>([]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [cameraRotation, setCameraRotation] = useState({
    theta: Math.PI / 4,
    phi: Math.PI / 4,
  });
  const [cameraDistance, setCameraDistance] = useState(
    Math.max(result.container.dimensions.x, result.container.dimensions.z) * 2,
  );

  // Convert container and boxes to usable format
  const containerDimensions = {
    width: result.container.dimensions.x,
    height: result.container.dimensions.y,
    depth: result.container.dimensions.z,
  };

  const boxes = result.packedBoxes.map((box) => ({
    id: box.id,
    width: box.dimensions.x,
    height: box.dimensions.y,
    depth: box.dimensions.z,
    x: box.position.x,
    y: box.position.y,
    z: box.position.z,
    color: box.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    name: box.name,
    weight: box.weight,
  }));

  const totalSteps = boxes.length;

  // Inicializar Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      10000,
    );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(
      containerDimensions.width,
      containerDimensions.height * 2,
      containerDimensions.depth,
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -containerDimensions.width;
    directionalLight.shadow.camera.right = containerDimensions.width * 2;
    directionalLight.shadow.camera.top = containerDimensions.height * 2;
    directionalLight.shadow.camera.bottom = -containerDimensions.depth;
    scene.add(directionalLight);

    // Contenedor
    const containerGeometry = new THREE.BoxGeometry(
      containerDimensions.width,
      containerDimensions.height,
      containerDimensions.depth,
    );
    const containerEdges = new THREE.EdgesGeometry(containerGeometry);
    const containerLines = new THREE.LineSegments(
      containerEdges,
      new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }),
    );
    containerLines.position.set(
      containerDimensions.width / 2,
      containerDimensions.height / 2,
      containerDimensions.depth / 2,
    );
    scene.add(containerLines);

    // Piso del contenedor
    const floorGeometry = new THREE.PlaneGeometry(
      containerDimensions.width,
      containerDimensions.depth,
    );
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d3436,
      transparent: true,
      opacity: 0.5,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(
      containerDimensions.width / 2,
      0,
      containerDimensions.depth / 2,
    );
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const gridHelper = new THREE.GridHelper(
      Math.max(containerDimensions.width, containerDimensions.depth),
      10,
      0x555555,
      0x333333,
    );
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Actualizar posición de cámara
  useEffect(() => {
    if (!cameraRef.current) return;

    const centerX = containerDimensions.width / 2;
    const centerY = containerDimensions.height / 2;
    const centerZ = containerDimensions.depth / 2;

    const x =
      centerX +
      cameraDistance *
        Math.sin(cameraRotation.theta) *
        Math.cos(cameraRotation.phi);
    const y = centerY + cameraDistance * Math.sin(cameraRotation.phi);
    const z =
      centerZ +
      cameraDistance *
        Math.cos(cameraRotation.theta) *
        Math.cos(cameraRotation.phi);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(centerX, centerY, centerZ);
  }, [cameraRotation, cameraDistance]);

  // Controles de mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    setCameraRotation((prev) => ({
      theta: prev.theta - deltaX * 0.01,
      phi: Math.max(0.1, Math.min(Math.PI - 0.1, prev.phi + deltaY * 0.01)),
    }));

    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const minDistance =
      Math.max(containerDimensions.width, containerDimensions.depth) * 0.5;
    const maxDistance =
      Math.max(containerDimensions.width, containerDimensions.depth) * 4;
    setCameraDistance((prev) =>
      Math.max(minDistance, Math.min(maxDistance, prev + e.deltaY * 0.5)),
    );
  };

  // Función de interpolación suave
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Actualizar cajas en la escena
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Limpiar cajas anteriores
    boxMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    boxMeshesRef.current = [];

    // Cajas completadas
    for (let i = 0; i < currentStep; i++) {
      const box = boxes[i];
      const geometry = new THREE.BoxGeometry(box.width, box.height, box.depth);
      const material = new THREE.MeshStandardMaterial({
        color: box.color,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        box.x + box.width / 2,
        box.y + box.height / 2,
        box.z + box.depth / 2,
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Agregar bordes
      const edges = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
      mesh.add(edgesMesh);

      scene.add(mesh);
      boxMeshesRef.current.push(mesh);
    }

    // Caja animada actual
    if (currentStep < boxes.length) {
      const box = boxes[currentStep];
      const easedProgress = easeInOutCubic(animationProgress);

      const startY = containerDimensions.height + box.height + 50;
      const endY = box.y + box.height / 2;
      const currentY = startY + (endY - startY) * easedProgress;

      const geometry = new THREE.BoxGeometry(box.width, box.height, box.depth);
      const material = new THREE.MeshStandardMaterial({
        color: box.color,
        transparent: true,
        opacity: 0.6 + 0.4 * easedProgress,
        emissive: new THREE.Color(box.color),
        emissiveIntensity: 0.3 * (1 - easedProgress),
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(box.x + box.width / 2, currentY, box.z + box.depth / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Rotación sutil durante la caída
      mesh.rotation.y = (1 - easedProgress) * 0.3;

      // Agregar bordes
      const edges = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
      mesh.add(edgesMesh);

      scene.add(mesh);
      boxMeshesRef.current.push(mesh);
    }
  }, [currentStep, animationProgress, boxes]);

  // Loop de animación
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const increment = 0.02 * speed;
        const newProgress = prev + increment;

        if (newProgress >= 1) {
          if (currentStep < boxes.length - 1) {
            setCurrentStep(currentStep + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 1;
          }
        }
        return newProgress;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, speed, boxes.length]);

  // Controles
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimationProgress(0);
  };
  const skipToStep = (step: number) => {
    setIsPlaying(false);
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
    setAnimationProgress(0);
  };
  const nextStep = () => skipToStep(currentStep + 1);
  const previousStep = () => skipToStep(currentStep - 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Visualizador 3D */}
      <div
        ref={mountRef}
        className="flex-1 cursor-grab active:cursor-grabbing"
        style={{ minHeight: "400px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Instrucciones */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg text-white text-sm">
        <p className="font-semibold mb-1">🎮 Controls:</p>
        <p>🖱️ Click + Drag: Rotate</p>
        <p>🔄 Scroll: Zoom</p>
      </div>

      {/* Panel de controles */}
      <div className="bg-slate-700 p-4 mt-2 rounded">
        {/* Progreso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-slate-300 text-xs">
              Progress: {Math.round(animationProgress * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200 rounded-full"
              style={{
                width: `${((currentStep + animationProgress) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controles principales */}
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
            title="Reset"
          >
            ⏮ Reset
          </button>

          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ⏪ Prev
          </button>

          {!isPlaying ? (
            <button
              onClick={play}
              disabled={
                currentStep === totalSteps - 1 && animationProgress >= 1
              }
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ▶ Play
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded text-sm transition-colors"
            >
              ⏸ Pause
            </button>
          )}

          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next ⏩
          </button>

          <button
            onClick={() => skipToStep(totalSteps - 1)}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
            title="Skip to end"
          >
            End ⏭
          </button>
        </div>

        {/* Control de velocidad */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-slate-300 text-xs">Speed:</span>
          {[0.5, 1, 1.5, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs ${
                speed === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-600 text-slate-300 hover:bg-slate-500"
              } transition-colors`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Info de la caja actual */}
        {currentStep < boxes.length && (
          <div className="p-2 bg-slate-600 rounded text-white text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: boxes[currentStep].color }}
              />
              <span className="font-semibold">Box {currentStep + 1}:</span>
              <span className="text-slate-200">
                {boxes[currentStep].name || boxes[currentStep].id}
              </span>
              <span className="text-slate-300">
                ({boxes[currentStep].width} × {boxes[currentStep].height} ×{" "}
                {boxes[currentStep].depth} cm, {boxes[currentStep].weight} kg)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingViewer3DIntegrated;
