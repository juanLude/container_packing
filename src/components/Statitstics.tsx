import { PackingResult } from "../algorithms/types";

interface StatisticsProps {
  result: PackingResult;
}

export default function Statistics({ result }: StatisticsProps) {
  const {
    packedBoxes,
    unpackedBoxes,
    volumeUtilization,
    weightUtilization,
    totalWeight,
    centerOfGravity,
    isStable,
    packingTime,
    levels,
  } = result;

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Packed Boxes"
          value={packedBoxes.length}
          icon="📦"
          color="blue"
        />
        <StatCard
          label="Unpacked Boxes"
          value={unpackedBoxes.length}
          icon="⚠️"
          color={unpackedBoxes.length > 0 ? "red" : "gray"}
        />
        <StatCard
          label="Volume Used"
          value={`${volumeUtilization.toFixed(1)}%`}
          icon="📊"
          color="green"
        />
        <StatCard
          label="Weight Used"
          value={`${weightUtilization.toFixed(1)}%`}
          icon="⚖️"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Utilization Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Volume Utilization</span>
              <span className="font-medium">
                {volumeUtilization.toFixed(2)}%
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(volumeUtilization, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Weight Utilization</span>
              <span className="font-medium">
                {weightUtilization.toFixed(2)}%
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(weightUtilization, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm text-slate-300 mb-1">Total Weight</div>
            <div className="text-2xl font-bold text-white">
              {totalWeight.toLocaleString()} kg
            </div>
            <div className="text-xs text-slate-400">
              Max: {result.container.maxWeight.toLocaleString()} kg
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Stability</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isStable
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isStable ? "Stable ✓" : "Unstable ⚠"}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Center of Gravity: ({centerOfGravity.x.toFixed(1)},{" "}
              {centerOfGravity.y.toFixed(1)}, {centerOfGravity.z.toFixed(1)})
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-300 mb-1">Packing Time</div>
            <div className="text-xl font-bold text-white">
              {packingTime.toFixed(2)} ms
            </div>
          </div>

          {levels && (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-sm text-slate-300 mb-1">Levels</div>
              <div className="text-xl font-bold text-white">{levels}</div>
            </div>
          )}
        </div>
      </div>

      {unpackedBoxes.length > 0 && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-medium text-red-400 mb-1">
                {unpackedBoxes.length} box{unpackedBoxes.length > 1 ? "es" : ""}{" "}
                could not be packed
              </div>
              <div className="text-sm text-red-300/80">
                Consider using a larger container or removing some items.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: "blue" | "red" | "green" | "purple" | "gray";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    red: "from-red-500/20 to-orange-500/20 border-red-500/30",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    gray: "from-slate-500/20 to-slate-600/20 border-slate-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-300">{label}</div>
    </div>
  );
}
