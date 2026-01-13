import { AlgorithmType } from "../algorithms/types";

interface ControlsProps {
  algorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onPack: () => void;
  onClear: () => void;
  onExport: () => void;
  isLoading: boolean;
  hasResult: boolean;
  boxCount: number;
}

export default function Controls({
  algorithm,
  onAlgorithmChange,
  onPack,
  onClear,
  onExport,
  isLoading,
  hasResult,
  boxCount,
}: ControlsProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Controls</h3>

      {/* Algorithm Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Packing Algorithm
        </label>
        <div className="space-y-2">
          <AlgorithmOption
            value="heuristic"
            selected={algorithm === "heuristic"}
            onChange={onAlgorithmChange}
            label="Heuristic (Fast)"
            description="Quick first-fit algorithm, good for most cases"
          />
          <AlgorithmOption
            value="ebAfit"
            selected={algorithm === "ebAfit"}
            onChange={onAlgorithmChange}
            label="EB-AFIT (Optimal)"
            description="Advanced algorithm for better space utilization"
            badge="Coming Soon"
          />
          <AlgorithmOption
            value="bruteForce"
            selected={algorithm === "bruteForce"}
            onChange={onAlgorithmChange}
            label="Brute Force"
            description="Exhaustive search (slow, for small sets)"
            badge="Coming Soon"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onPack}
          disabled={isLoading || boxCount === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            <>
              <span>🚀</span>
              Pack Container
            </>
          )}
        </button>

        <button
          onClick={onExport}
          disabled={!hasResult}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          📥 Export Result
        </button>

        <button
          onClick={onClear}
          disabled={boxCount === 0}
          className="w-full bg-red-600/20 hover:bg-red-600/30 disabled:bg-slate-700/50 text-red-400 font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed disabled:text-slate-500"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="text-xs text-slate-400">
          <div className="mb-2">
            <span className="font-medium">Tips:</span>
          </div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Add boxes manually or import from CSV</li>
            <li>Mark fragile items to prevent crushing</li>
            <li>Enable/disable stackability per box</li>
            <li>Click boxes in 3D view to see details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface AlgorithmOptionProps {
  value: AlgorithmType;
  selected: boolean;
  onChange: (value: AlgorithmType) => void;
  label: string;
  description: string;
  badge?: string;
}

function AlgorithmOption({
  value,
  selected,
  onChange,
  label,
  description,
  badge,
}: AlgorithmOptionProps) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-slate-700 bg-slate-700/30 hover:border-slate-600"
      }`}
    >
      <input
        type="radio"
        name="algorithm"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400 mt-1">{description}</div>
      </div>
    </label>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
