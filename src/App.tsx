import { useState } from "react";
import ContainerScene from "./ContainerScene";
import type { BoxInput, PlacedBox } from "./PackingLogic";
import { calculatePacking } from "./PackingLogic";

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

  const handlePack = () => {
    const packed = calculatePacking(container, items);
    setPackedBoxes(packed);
  };

  const handleExport = () => {
    const exportData = {
      container,
      items,
      packedBoxes,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packing-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Container Packing App</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="font-semibold mb-2">Container Dimensions</h2>
          <input
            type="number"
            placeholder="Length"
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
          <h2 className="font-semibold mb-2">Item Dimensions</h2>
          {items.map((item, idx) => (
            <div key={idx} className="mb-2">
              <input
                type="number"
                placeholder="Length"
                value={item.length}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].length = Number(e.target.value);
                  setItems(newItems);
                }}
                className="border p-1 mr-2"
              />
              <input
                type="number"
                placeholder="Width"
                value={item.width}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].width = Number(e.target.value);
                  setItems(newItems);
                }}
                className="border p-1 mr-2"
              />
              <input
                type="number"
                placeholder="Height"
                value={item.height}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].height = Number(e.target.value);
                  setItems(newItems);
                }}
                className="border p-1 mr-2"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].quantity = Number(e.target.value);
                  setItems(newItems);
                }}
                className="border p-1"
              />
            </div>
          ))}
          <button
            onClick={() =>
              setItems([
                ...items,
                { length: 10, width: 10, height: 10, quantity: 1 },
              ])
            }
            className="bg-blue-500 text-white px-2 py-1 mt-2 rounded"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handlePack}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Pack Container
        </button>

        <button
          onClick={handleExport}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Export Results
        </button>
      </div>

      <ContainerScene container={container} boxes={packedBoxes} />
    </div>
  );
}
