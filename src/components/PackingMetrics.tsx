interface PackingMetrics {
  containerVolume: number;
  usedVolume: number;
  utilization: number; // percentage
}

interface PackingMetricsPanelProps {
  metrics: PackingMetrics;
}
export default function PackingMetrics({ metrics }: PackingMetricsPanelProps) {
  return (
    <div className="rounded-2xl p-4 shadow-md bg-white max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        📦 Packing Efficiency
      </h2>

      <div className="mb-3">
        <div className="text-sm text-gray-500">Container Volume</div>
        <div className="text-base font-medium text-gray-700">
          {metrics.containerVolume.toLocaleString()} units³
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-500">Used Volume</div>
        <div className="text-base font-medium text-gray-700">
          {metrics.usedVolume.toLocaleString()} units³
        </div>
      </div>

      <div className="mb-1">
        <span className="text-sm text-gray-500">Utilization</span>
        <div className="text-sm font-medium text-gray-700">
          {metrics.utilization}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${metrics.utilization}%` }}
          />
        </div>
      </div>
    </div>
  );
}
