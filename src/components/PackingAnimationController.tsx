// PackingAnimationController.tsx
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface Box {
  id: string;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  color?: string;
}

interface AnimationStep {
  box: Box;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  rotation: THREE.Euler;
}

export const usePackingAnimation = (
  boxes: Box[],
  containerDimensions: { width: number; height: number; depth: number },
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animatedBoxes, setAnimatedBoxes] = useState<Box[]>([]);
  const animationRef = useRef<number>();

  // Preparar los pasos de la animación
  const prepareAnimationSteps = (): AnimationStep[] => {
    return boxes.map((box, index) => ({
      box,
      startPosition: new THREE.Vector3(
        containerDimensions.width / 2,
        containerDimensions.height + box.height + 5,
        containerDimensions.depth / 2,
      ),
      endPosition: new THREE.Vector3(
        box.x + box.width / 2,
        box.y + box.height / 2,
        box.z + box.depth / 2,
      ),
      rotation: new THREE.Euler(0, 0, 0),
    }));
  };

  const animationSteps = prepareAnimationSteps();

  // Función de interpolación suave (ease-in-out)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Animar un paso individual
  const animateStep = (stepIndex: number, progress: number) => {
    if (stepIndex >= animationSteps.length) return;

    const step = animationSteps[stepIndex];
    const easedProgress = easeInOutCubic(progress);

    // Interpolar posición
    const currentPosition = new THREE.Vector3().lerpVectors(
      step.startPosition,
      step.endPosition,
      easedProgress,
    );

    // Crear caja animada
    const animatedBox: Box = {
      ...step.box,
      x: currentPosition.x - step.box.width / 2,
      y: currentPosition.y - step.box.height / 2,
      z: currentPosition.z - step.box.depth / 2,
    };

    return animatedBox;
  };

  // Loop de animación
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setAnimationProgress((prev) => {
        const newProgress = prev + 0.02; // Velocidad de animación

        if (newProgress >= 1) {
          // Paso completado
          setAnimatedBoxes((prevBoxes) => [...prevBoxes, boxes[currentStep]]);

          if (currentStep < boxes.length - 1) {
            setCurrentStep(currentStep + 1);
            return 0;
          } else {
            // Animación completada
            setIsPlaying(false);
            return 1;
          }
        }

        return newProgress;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, boxes]);

  // Controles de animación
  const play = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimationProgress(0);
    setAnimatedBoxes([]);
  };

  const skipToStep = (stepIndex: number) => {
    setIsPlaying(false);
    setCurrentStep(stepIndex);
    setAnimationProgress(0);
    setAnimatedBoxes(boxes.slice(0, stepIndex));
  };

  const nextStep = () => {
    if (currentStep < boxes.length - 1) {
      skipToStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      skipToStep(currentStep - 1);
    }
  };

  // Obtener cajas visibles actuales
  const getVisibleBoxes = (): Box[] => {
    const completedBoxes = animatedBoxes;
    const currentAnimatedBox = animateStep(currentStep, animationProgress);

    return currentAnimatedBox
      ? [...completedBoxes, currentAnimatedBox]
      : completedBoxes;
  };

  return {
    currentStep,
    totalSteps: boxes.length,
    isPlaying,
    animationProgress,
    visibleBoxes: getVisibleBoxes(),
    controls: {
      play,
      pause,
      reset,
      nextStep,
      previousStep,
      skipToStep,
    },
  };
};

// Componente de controles UI
export const AnimationControls = ({
  currentStep,
  totalSteps,
  isPlaying,
  animationProgress,
  controls,
}: {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  animationProgress: number;
  controls: ReturnType<typeof usePackingAnimation>["controls"];
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      {/* Indicador de progreso */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">
          Paso {currentStep + 1} de {totalSteps}
        </span>
        <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{
              width: `${((currentStep + animationProgress) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={controls.reset}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          title="Reiniciar"
        >
          ⏮
        </button>

        <button
          onClick={controls.previousStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          title="Paso anterior"
        >
          ⏪
        </button>

        {!isPlaying ? (
          <button
            onClick={controls.play}
            disabled={currentStep === totalSteps - 1 && animationProgress >= 1}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            title="Reproducir"
          >
            ▶ Reproducir
          </button>
        ) : (
          <button
            onClick={controls.pause}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            title="Pausar"
          >
            ⏸ Pausar
          </button>
        )}

        <button
          onClick={controls.nextStep}
          disabled={currentStep === totalSteps - 1}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          title="Paso siguiente"
        >
          ⏩
        </button>

        <button
          onClick={() => controls.skipToStep(totalSteps - 1)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          title="Ir al final"
        >
          ⏭
        </button>
      </div>

      {/* Timeline interactiva */}
      <div className="flex gap-1 mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <button
            key={index}
            onClick={() => controls.skipToStep(index)}
            className={`flex-1 h-8 rounded transition-colors ${
              index < currentStep
                ? "bg-green-600 hover:bg-green-700"
                : index === currentStep
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 hover:bg-gray-700"
            }`}
            title={`Ir al paso ${index + 1}`}
          >
            <span className="text-white text-xs">{index + 1}</span>
          </button>
        ))}
      </div>

      {/* Información de la caja actual */}
      <div className="text-white text-sm bg-gray-700 p-2 rounded">
        <strong>Progreso:</strong> {Math.round(animationProgress * 100)}%
      </div>
    </div>
  );
};

// Hook para velocidad de animación ajustable
export const useAnimationSpeed = () => {
  const [speed, setSpeed] = useState(1);

  const speedOptions = [
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
    { label: "3x", value: 3 },
  ];

  return { speed, setSpeed, speedOptions };
};
