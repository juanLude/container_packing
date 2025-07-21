import { useState } from "react";
import ContainerScene from "./ContainerScene";
import type { BoxInput, PackingResult, PlacedBox } from "./PackingLogic";
import { calculatePacking } from "./PackingLogic";

import ExportDropdown from "./components/ExportDropdown";
import StandardSizes from "./components/StandardSizes";
import { calculateBestFitPacking } from "./BestFitPacking"; // Updated filename
import PackingMetrics from "./components/PackingMetrics";
import { calculatePackingMetrics } from "./utils/calculatePackingMetrics";
export default function App() {
  const [container, setContainer] = useState({
    length: 100,
    width: 100,
    height: 100,
  });

  const [items, setItems] = useState<BoxInput[]>([
    { length: 20, width: 20, height: 20, quantity: 3 },
  ]);

  const [packedBoxes, setPackedBoxes] = useState<PlacedBox[]>([]);
  const [result, setResult] = useState<PackingResult>({
    placedBoxes: [],
    unplacedBoxes: [],
  });

  const [strategy, setStrategy] = useState<"simple" | "best-fit">("simple");

  const handlePack = () => {
    const packed =
      strategy === "best-fit"
        ? calculateBestFitPacking(container, items)
        : calculatePacking(container, items);

    setPackedBoxes(packed.placedBoxes);
    setResult(packed);
  };
  // const result = calculateBestFitPacking(container, items);
  const metrics = calculatePackingMetrics(container, result.placedBoxes);
  return (
    <div className="w-full min-h-screen overflow-y-auto overflow-x-hidden p-4">
      <h2 className="text-2xl font-bold mb-4 no-margin-top">
        Container Packing App
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <StandardSizes setContainer={setContainer} container={container} />
          <input
            type="number"
            placeholder="Length (cm)"
            value={container.length}
            onChange={(e) =>
              setContainer({ ...container, length: Number(e.target.value) })
            }
            className="border p-1 mr-2"
          />
          <input
            type="number"
            placeholder="Width"
            value={container.width}
            onChange={(e) =>
              setContainer({ ...container, width: Number(e.target.value) })
            }
            className="border p-1 mr-2"
          />
          <input
            type="number"
            placeholder="Height"
            value={container.height}
            onChange={(e) =>
              setContainer({ ...container, height: Number(e.target.value) })
            }
            className="border p-1"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Item Dimensions (m)</h3>

          <table className="table-auto w-full text-sm mb-2 border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Length</th>
                <th className="border px-2 py-1">Width</th>
                <th className="border px-2 py-1">Height</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.length}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].length = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.width}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].width = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.height}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].height = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== idx);
                        setItems(newItems);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() =>
              setItems([
                ...items,
                { length: 1, width: 1, height: 1, quantity: 1 },
              ])
            }
            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as "simple" | "best-fit")}
          className="border p-1 rounded"
        >
          <option value="simple">Simple (Row-by-Row)</option>
          <option value="best-fit">Best-Fit (Optimized)</option>
        </select>
        <button
          onClick={handlePack}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Pack Container
        </button>
        <ExportDropdown
          container={container}
          items={items}
          packedBoxes={packedBoxes}
        />
      </div>

      <div className="mt-6 border p-4 rounded bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">Packed Container Preview</h2>
        <div className="w-full min-h-[800px]">
          <ContainerScene
            container={container}
            boxes={packedBoxes}
            unplacedBoxes={result.unplacedBoxes}
          />
        </div>
      </div>

      {result.unplacedBoxes.length > 0 && (
        <div className="text-red-600 mt-4">
          <p>⚠️ These boxes did not fit in the container:</p>
          <ul>
            {result.unplacedBoxes.map((box, idx) => (
              <li key={idx}>
                {box.quantity} box(es) of {box.length}x{box.width}x{box.height}
              </li>
            ))}
          </ul>
        </div>
      )}
      <PackingMetrics metrics={metrics} />
    </div>
  );
}
