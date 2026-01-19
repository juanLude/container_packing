import { useState } from "react";
import {
  Box,
  Container,
  PackingResult,
  AlgorithmType,
} from "./algorithms/types";
import { heuristicPacking } from "./algorithms/heuristic";
import BoxInput from "./components/BoxInput";
import ContainerViewer from "./components/ContainerViewer";
import Statistics from "./components/Statitstics";
import Controls from "./components/Controls";
import CSVImport from "./components/CSVImport";
import PDFPackingInstructions from "./components/PDFPackingInstructions";
import "./App.css";

const defaultContainer: Container = {
  id: "container-1",
  name: "Standard 20ft Container",
  dimensions: { x: 589, y: 239, z: 235 }, // cm
  maxWeight: 28000, // kg
  maxWeightPerLevel: 10000,
};

function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [container, setContainer] = useState<Container>(defaultContainer);
  const [packingResult, setPackingResult] = useState<PackingResult | null>(
    null
  );
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<AlgorithmType>("heuristic");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBox = (box: Box) => {
    setBoxes([...boxes, box]);
  };

  const handleRemoveBox = (id: string) => {
    setBoxes(boxes.filter((b) => b.id !== id));
  };

  const handleImportBoxes = (importedBoxes: Box[]) => {
    setBoxes([...boxes, ...importedBoxes]);
  };

  const handleClearAll = () => {
    setBoxes([]);
    setPackingResult(null);
  };

  const handlePack = async () => {
    if (boxes.length === 0) {
      alert("Please add some boxes first!");
      return;
    }

    setIsLoading(true);

    // Simulate async operation for better UX
    setTimeout(() => {
      try {
        let result: PackingResult;

        switch (selectedAlgorithm) {
          case "heuristic":
            result = heuristicPacking(boxes, container, {
              algorithm: "heuristic",
              respectStackability: true,
              respectFragility: true,
            });
            break;
          case "ebAfit":
            // TODO: Implement EB-AFIT algorithm
            result = heuristicPacking(boxes, container, {
              algorithm: "ebAfit",
            });
            break;
          case "bruteForce":
            // TODO: Implement brute force (limited to small sets)
            result = heuristicPacking(boxes, container, {
              algorithm: "bruteForce",
            });
            break;
          default:
            result = heuristicPacking(boxes, container, {
              algorithm: "heuristic",
            });
        }

        setPackingResult(result);
      } catch (error) {
        console.error("Packing error:", error);
        alert("An error occurred during packing. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleExport = () => {
    if (!packingResult) return;

    const data = {
      container: packingResult.container,
      packedBoxes: packingResult.packedBoxes,
      unpackedBoxes: packingResult.unpackedBoxes,
      statistics: {
        volumeUtilization: packingResult.volumeUtilization,
        weightUtilization: packingResult.weightUtilization,
        totalWeight: packingResult.totalWeight,
        centerOfGravity: packingResult.centerOfGravity,
        isStable: packingResult.isStable,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packing-result-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Container Packing Optimizer
          </h1>
          <p className="text-slate-400">
            Optimize your container loading with advanced algorithms
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1 space-y-6">
            <BoxInput onAddBox={handleAddBox} />
            <CSVImport onImport={handleImportBoxes} />

            {/* Box List */}
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                Boxes ({boxes.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {boxes.map((box) => (
                  <div
                    key={box.id}
                    className="flex items-center justify-between bg-slate-700 p-3 rounded"
                  >
                    <div className="text-sm text-white">
                      <div className="font-medium">{box.name || box.id}</div>
                      <div className="text-slate-400">
                        {box.dimensions.x} × {box.dimensions.y} ×{" "}
                        {box.dimensions.z} cm
                        {" | "}
                        {box.weight} kg
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBox(box.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {boxes.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    No boxes added yet
                  </div>
                )}
              </div>
            </div>

            <Controls
              algorithm={selectedAlgorithm}
              onAlgorithmChange={setSelectedAlgorithm}
              onPack={handlePack}
              onClear={handleClearAll}
              onExport={handleExport}
              isLoading={isLoading}
              hasResult={!!packingResult}
              boxCount={boxes.length}
            />

            {/* PDF Button - Only visible when there's a result */}
            {packingResult && (
              <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">
                  📄 Documentation
                </h3>
                <PDFPackingInstructions result={packingResult} />
                <p className="mt-3 text-xs text-slate-400 text-center">
                  A new window will open with the instructions. Use Ctrl+P
                  (Cmd+P on Mac) and select "Save as PDF"
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                3D Visualization
              </h3>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                {packingResult ? (
                  <ContainerViewer result={packingResult} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <div>Add boxes and click "Pack" to visualize</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {packingResult && <Statistics result={packingResult} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
