import { useState } from "react";
import { Box } from "../algorithms/types";

interface BoxInputProps {
  onAddBox: (box: Box) => void;
}

export default function BoxInput({ onAddBox }: BoxInputProps) {
  const [name, setName] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fragile, setFragile] = useState(false);
  const [stackable, setStackable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!length || !width || !height || !weight) {
      alert("Please fill in all required fields");
      return;
    }

    const box: Box = {
      id: `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || undefined,
      dimensions: {
        x: parseFloat(length),
        y: parseFloat(height),
        z: parseFloat(width),
      },
      weight: parseFloat(weight),
      fragile,
      stackable,
      color: generateRandomColor(),
    };

    onAddBox(box);

    // Reset form
    setName("");
    setLength("");
    setWidth("");
    setHeight("");
    setWeight("");
    setFragile(false);
    setStackable(true);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Add Box</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Electronics Box"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Length (cm) *
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="100"
              min="0.1"
              step="0.1"
              required
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Width (cm) *
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="80"
              min="0.1"
              step="0.1"
              required
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Height (cm) *
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="60"
              min="0.1"
              step="0.1"
              required
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Weight (kg) *
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="50"
            min="0.1"
            step="0.1"
            required
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center text-slate-300">
            <input
              type="checkbox"
              checked={fragile}
              onChange={(e) => setFragile(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            Fragile
          </label>
          <label className="flex items-center text-slate-300">
            <input
              type="checkbox"
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            Stackable
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Add Box
        </button>
      </form>
    </div>
  );
}

function generateRandomColor(): string {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
