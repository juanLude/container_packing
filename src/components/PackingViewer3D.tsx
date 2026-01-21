import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PackingViewer3D = () => {
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
  const [cameraDistance, setCameraDistance] = useState(25);

  // Datos de ejemplo
  const containerDimensions = { width: 10, height: 8, depth: 6 };
  const boxes = [
    {
      id: "1",
      width: 2,
      height: 2,
      depth: 2,
      x: 0,
      y: 0,
      z: 0,
      color: "#ff6b6b",
    },
    {
      id: "2",
      width: 3,
      height: 2,
      depth: 2,
      x: 2.5,
      y: 0,
      z: 0,
      color: "#4ecdc4",
    },
    {
      id: "3",
      width: 2,
      height: 3,
      depth: 2,
      x: 0,
      y: 0,
      z: 2.5,
      color: "#45b7d1",
    },
    {
      id: "4",
      width: 2,
      height: 2,
      depth: 1.5,
      x: 6,
      y: 0,
      z: 0,
      color: "#96ceb4",
    },
    {
      id: "5",
      width: 1.5,
      height: 2,
      depth: 2,
      x: 2.5,
      y: 0,
      z: 2.5,
      color: "#ffeaa7",
    },
  ];

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
      1000,
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
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
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
    setCameraDistance((prev) =>
      Math.max(10, Math.min(50, prev + e.deltaY * 0.05)),
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

      const startY = containerDimensions.height + box.height + 5;
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
  }, [currentStep, animationProgress]);

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
  }, [isPlaying, currentStep, speed]);

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
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Visualizador 3D */}
      <div
        ref={mountRef}
        className="flex-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Instrucciones */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg text-white text-sm">
        <p className="font-semibold mb-1">🎮 Controles:</p>
        <p>🖱️ Click + Arrastrar: Rotar</p>
        <p>🔄 Scroll: Zoom</p>
      </div>

      {/* Panel de controles */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        {/* Progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">
              Paso {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-gray-400 text-xs">
              Progreso: {Math.round(animationProgress * 100)}%
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200 rounded-full"
              style={{
                width: `${((currentStep + animationProgress) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controles principales */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Reiniciar"
          >
            ⏮ Reiniciar
          </button>

          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ⏪ Anterior
          </button>

          {!isPlaying ? (
            <button
              onClick={play}
              disabled={
                currentStep === totalSteps - 1 && animationProgress >= 1
              }
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              ▶ Reproducir
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              ⏸ Pausar
            </button>
          )}

          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente ⏩
          </button>

          <button
            onClick={() => skipToStep(totalSteps - 1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Ir al final"
          >
            Final ⏭
          </button>
        </div>

        {/* Control de velocidad */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-400 text-sm">Velocidad:</span>
          {[0.5, 1, 1.5, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 rounded ${
                speed === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } transition-colors text-sm`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex gap-1 mt-4">
          {boxes.map((box, index) => (
            <button
              key={box.id}
              onClick={() => skipToStep(index)}
              className={`flex-1 h-10 rounded transition-all ${
                index < currentStep
                  ? "bg-green-600 hover:bg-green-700"
                  : index === currentStep
                    ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-300"
                    : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={`Caja ${index + 1}: ${box.width}×${box.height}×${box.depth}`}
              style={{
                backgroundColor: index <= currentStep ? box.color : undefined,
              }}
            >
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </button>
          ))}
        </div>

        {/* Info de la caja actual */}
        {currentStep < boxes.length && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg text-white text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: boxes[currentStep].color }}
              />
              <span className="font-semibold">Caja {currentStep + 1}:</span>
              <span className="text-gray-300">
                {boxes[currentStep].width} × {boxes[currentStep].height} ×{" "}
                {boxes[currentStep].depth} unidades
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingViewer3D;
