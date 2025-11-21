import { PlayerStats } from "@/types/timer";
import React from "react";

interface PlayerStatsChartProps {
  stats: PlayerStats;
  size?: number;
  color?: string;
}

export const PlayerStatsChart: React.FC<PlayerStatsChartProps> = ({
  stats,
  size = 200,
  color = "#3b82f6", // blue-500
}) => {
  const center = size / 2;
  const radius = size / 2 - 30; // Padding for labels
  const labels = Object.keys(stats);
  const data = Object.values(stats);
  const totalAxes = labels.length;

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, max: number = 100) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = (value / max) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate points for the data polygon
  const points = data
    .map((val, i) => {
      const { x, y } = getCoordinates(val, i);
      return `${x},${y}`;
    })
    .join(" ");

  // Generate grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Background */}
        {levels.map((level, lvlIndex) => (
          <polygon
            key={level}
            points={labels
              .map((_, i) => {
                const { x, y } = getCoordinates(level, i);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#334155" // slate-700
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Axis Lines */}
        {labels.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={points}
          fill={color}
          fillOpacity="0.4"
          stroke={color}
          strokeWidth="2"
        />

        {/* Data Points */}
        {data.map((val, i) => {
          const { x, y } = getCoordinates(val, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              stroke="#0f172a"
              strokeWidth="1"
            />
          );
        })}

        {/* Labels */}
        {labels.map((label, i) => {
          // Push labels out slightly further than 100% radius
          const { x, y } = getCoordinates(115, i);

          // Adjust text anchor based on position
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (x < center - 10) textAnchor = "end";
          if (x > center + 10) textAnchor = "start";

          // Shorten labels
          const shortLabel = label.substring(0, 3).toUpperCase();

          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#94a3b8" // slate-400
              fontSize="10"
              fontWeight="bold"
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {shortLabel}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
