import { PackingResult, Box } from "../algorithms/types";

interface StatisticsProps {
  result: PackingResult;
}

export default function Statistics({ result }: StatisticsProps) {
  const {
    packedBoxes,
    unpackedBoxes = [],
    volumeUtilization,
    weightUtilization,
    totalWeight,
    centerOfGravity,
    isStable,
    container,
  } = result;

  const totalBoxes = packedBoxes.length + unpackedBoxes.length;
  const packingEfficiency =
    totalBoxes > 0 ? ((packedBoxes.length / totalBoxes) * 100).toFixed(1) : "0";

  // Calcular volumen total de cajas no empacadas
  const unpackedVolume = unpackedBoxes.reduce((sum, box: Box) => {
    return sum + box.dimensions.x * box.dimensions.y * box.dimensions.z;
  }, 0);

  // Calcular peso total de cajas no empacadas
  const unpackedWeight = unpackedBoxes.reduce((sum, box: Box) => {
    return sum + box.weight;
  }, 0);

  const containerVolume =
    container.dimensions.x * container.dimensions.y * container.dimensions.z;

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">
        📊 Packing Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box Count Stats */}
        <StatCard
          label="Total Boxes"
          value={totalBoxes.toString()}
          icon="📦"
          color="blue"
        />
        <StatCard
          label="Packed Boxes"
          value={packedBoxes.length.toString()}
          icon="✅"
          color="green"
        />

        {/* Unpacked Boxes - Highlighted if present */}
        {unpackedBoxes.length > 0 && (
          <>
            <StatCard
              label="Unpacked Boxes"
              value={unpackedBoxes.length.toString()}
              icon="⚠️"
              color="red"
              highlight={true}
            />
            <StatCard
              label="Packing Success Rate"
              value={`${packingEfficiency}%`}
              icon="📈"
              color={
                parseFloat(packingEfficiency) >= 80
                  ? "green"
                  : parseFloat(packingEfficiency) >= 50
                    ? "yellow"
                    : "red"
              }
            />
          </>
        )}

        {/* Volume Utilization */}
        <div className="col-span-1 md:col-span-2">
          <ProgressBar
            label="Volume Utilization"
            value={volumeUtilization}
            color="blue"
            icon="📏"
          />
        </div>

        {/* Weight Utilization */}
        <div className="col-span-1 md:col-span-2">
          <ProgressBar
            label="Weight Utilization"
            value={weightUtilization}
            color="purple"
            icon="⚖️"
          />
        </div>

        {/* Weight Stats */}
        <StatCard
          label="Total Weight (Packed)"
          value={`${totalWeight.toFixed(0)} kg`}
          icon="🏋️"
          color="indigo"
        />
        <StatCard
          label="Max Container Weight"
          value={`${container.maxWeight.toLocaleString()} kg`}
          icon="🚧"
          color="gray"
        />

        {/* Unpacked Weight */}
        {unpackedBoxes.length > 0 && (
          <>
            <StatCard
              label="Unpacked Weight"
              value={`${unpackedWeight.toFixed(0)} kg`}
              icon="⚠️"
              color="red"
              highlight={true}
            />
            <StatCard
              label="Unpacked Volume"
              value={`${(unpackedVolume / 1000000).toFixed(2)} m³`}
              icon="📦"
              color="red"
              highlight={true}
            />
          </>
        )}

        {/* Stability */}
        <div
          className={`col-span-1 md:col-span-2 p-4 rounded-lg ${
            isStable
              ? "bg-green-900/30 border border-green-500"
              : "bg-red-900/30 border border-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isStable ? "✅" : "⚠️"}</span>
            <div>
              <div className="font-semibold text-white">
                Load Stability: {isStable ? "Stable" : "Unstable"}
              </div>
              <div className="text-sm text-slate-300">
                Center of Gravity: ({centerOfGravity.x.toFixed(1)},{" "}
                {centerOfGravity.y.toFixed(1)}, {centerOfGravity.z.toFixed(1)})
              </div>
            </div>
          </div>
        </div>

        {/* Container Info */}
        <div className="col-span-1 md:col-span-2 p-4 bg-slate-700 rounded-lg">
          <div className="font-semibold text-white mb-2">
            📦 Container: {container.name}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <div>
              Dimensions: {container.dimensions.x} × {container.dimensions.y} ×{" "}
              {container.dimensions.z} cm
            </div>
            <div>Volume: {(containerVolume / 1000000).toFixed(2)} m³</div>
          </div>
        </div>

        {/* Unpacked Boxes Warning */}
        {unpackedBoxes.length > 0 && (
          <div className="col-span-1 md:col-span-2 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <div className="font-bold text-red-200 mb-2">
                  Unpacked Boxes Alert
                </div>
                <div className="text-sm text-red-300 space-y-1">
                  <p>
                    {unpackedBoxes.length} box(es) could not fit in the selected
                    container.
                  </p>
                  <p>
                    These boxes are visualized in the corner area with red
                    borders.
                  </p>
                  <p className="font-semibold mt-2">Recommendations:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Consider using a larger container</li>
                    <li>Repack with different box arrangements</li>
                    <li>Split shipment across multiple containers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unpacked Boxes List */}
        {unpackedBoxes.length > 0 && (
          <div className="col-span-1 md:col-span-2 p-4 bg-slate-700 rounded-lg">
            <div className="font-semibold text-white mb-3 flex items-center gap-2">
              <span>📋</span>
              Unpacked Boxes Details
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {unpackedBoxes.map((box: Box, index: number) => (
                <div
                  key={box.id}
                  className="p-2 bg-slate-600 rounded flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">#{index + 1}</span>
                    <div>
                      <div className="text-white font-medium">
                        {box.name || box.id}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {box.dimensions.x} × {box.dimensions.y} ×{" "}
                        {box.dimensions.z} cm | {box.weight} kg
                      </div>
                    </div>
                  </div>
                  {box.fragile && (
                    <span className="text-red-400 text-xs">🔴 Fragile</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "indigo" | "gray";
  highlight?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight = false,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-900/30 border-blue-500 text-blue-200",
    green: "bg-green-900/30 border-green-500 text-green-200",
    red: "bg-red-900/30 border-red-500 text-red-200",
    yellow: "bg-yellow-900/30 border-yellow-500 text-yellow-200",
    purple: "bg-purple-900/30 border-purple-500 text-purple-200",
    indigo: "bg-indigo-900/30 border-indigo-500 text-indigo-200",
    gray: "bg-gray-700 border-gray-600 text-gray-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} ${
        highlight ? "ring-2 ring-red-500 animate-pulse" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <div className="text-sm font-medium opacity-80">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  color: "blue" | "purple" | "green";
  icon: string;
}

function ProgressBar({ label, value, color, icon }: ProgressBarProps) {
  const colorClasses = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
  };

  return (
    <div className="p-4 bg-slate-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{label}</span>
        </div>
        <span className="text-xl font-bold text-white">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
