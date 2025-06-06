import { useState } from "react";

type Container = {
  length: number;
  width: number;
  height: number;
};

type StandardSizesProps = {
  setContainer: (container: Container) => void;
  container?: Container; // optional if you want to highlight selected container from parent
};

const standardContainers = [
  {
    type: "20'",
    length: 5.89,
    width: 2.35,
    height: 2.39,
  },
  {
    type: "40' HC",
    length: 12.03,
    width: 2.35,
    height: 2.69,
  },
];

export default function StandardSizes({
  setContainer,
  container,
}: StandardSizesProps) {
  // Use the container prop to set the selected type if container is passed
  const [selectedType, setSelectedType] = useState<string | null>(
    container
      ? standardContainers.find(
          (c) =>
            c.length === container.length &&
            c.width === container.width &&
            c.height === container.height
        )?.type || null
      : null
  );

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 text-center">
        Standard Container Sizes (metres)
      </h2>

      <table className="table-auto w-full border border-gray-400 border-collapse text-sm text-center rounded overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {["Type", "Length", "Width", "Height", "Volume (m³)"].map(
              (heading) => (
                <th
                  key={heading}
                  className="border border-gray-400 px-3 py-2 text-center"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {standardContainers.map((c) => {
            const isSelected = selectedType === c.type;
            return (
              <tr
                key={c.type}
                onClick={() => {
                  setContainer({
                    length: c.length,
                    width: c.width,
                    height: c.height,
                  });
                  setSelectedType(c.type);
                }}
                className={`cursor-pointer transition-colors hover:bg-gray-200 ${
                  isSelected ? "bg-blue-100 font-semibold" : ""
                }`}
              >
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {c.type}
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {c.length}
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {c.width}
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {c.height}
                </td>
                <td className="border border-gray-400 px-3 py-2 text-center">
                  {(c.length * c.width * c.height).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-xs mt-2 text-gray-500 text-center italic">
        Click a row to auto-fill dimensions
      </p>
    </div>
  );
}
