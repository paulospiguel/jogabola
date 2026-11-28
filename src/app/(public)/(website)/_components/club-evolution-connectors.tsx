"use client";

import { useEffect, useState } from "react";
import {
  EVOLUTION_EDGES,
  type EvolutionAccent,
  type EvolutionNodeId,
  getNodeById,
} from "./club-evolution-data";

interface MeasuredEdge {
  id: string;
  from: EvolutionNodeId;
  to: EvolutionNodeId;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  unlocked: boolean;
  accent: EvolutionAccent;
}

interface ClubEvolutionConnectorsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  nodeRefs: React.MutableRefObject<
    Partial<Record<EvolutionNodeId, HTMLButtonElement | null>>
  >;
  activeStage: number;
  highlightedEdgeIds: Set<string>;
  prefersReducedMotion: boolean;
}

const ACCENT_HEX: Record<EvolutionAccent, string> = {
  primary: "#7CFF4F",
  info: "#38BDF8",
  highlight: "#FACC15",
};

const LOCKED_STROKE = "#263244";

export function ClubEvolutionConnectors({
  containerRef,
  nodeRefs,
  activeStage,
  highlightedEdgeIds,
  prefersReducedMotion,
}: ClubEvolutionConnectorsProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [edges, setEdges] = useState<MeasuredEdge[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computePaths = () => {
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const measured: MeasuredEdge[] = [];

      for (const edge of EVOLUTION_EDGES) {
        const fromEl = nodeRefs.current[edge.from];
        const toEl = nodeRefs.current[edge.to];
        if (!fromEl || !toEl) continue;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const fromCenterX =
          fromRect.left - containerRect.left + fromRect.width / 2;
        const fromCenterY =
          fromRect.top - containerRect.top + fromRect.height / 2;
        const toCenterX = toRect.left - containerRect.left + toRect.width / 2;
        const toCenterY = toRect.top - containerRect.top + toRect.height / 2;

        const isHorizontal =
          edge.orientation === "horizontal" &&
          Math.abs(fromCenterY - toCenterY) < 24;

        let x1: number;
        let y1: number;
        let x2: number;
        let y2: number;
        let d: string;

        if (isHorizontal) {
          x1 = fromRect.right - containerRect.left;
          y1 = fromCenterY;
          x2 = toRect.left - containerRect.left;
          y2 = toCenterY;
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else {
          x1 = fromCenterX;
          y1 = fromRect.bottom - containerRect.top;
          x2 = toCenterX;
          y2 = toRect.top - containerRect.top;
          const midY = y1 + (y2 - y1) * 0.5;
          d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
        }

        const fromSpec = getNodeById(edge.from);
        const toSpec = getNodeById(edge.to);
        const unlocked =
          fromSpec.stageIndex <= activeStage &&
          toSpec.stageIndex <= activeStage;

        measured.push({
          id: edge.id,
          from: edge.from,
          to: edge.to,
          d,
          x1,
          y1,
          x2,
          y2,
          unlocked,
          accent: toSpec.accent,
        });
      }

      setSize({ width: containerRect.width, height: containerRect.height });
      setEdges(measured);
    };

    let rafId = window.requestAnimationFrame(computePaths);
    const scheduleCompute = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(computePaths);
    };

    const resizeObserver = new ResizeObserver(scheduleCompute);
    resizeObserver.observe(container);
    window.addEventListener("resize", scheduleCompute);
    void document.fonts?.ready.then(scheduleCompute);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleCompute);
    };
  }, [activeStage, containerRef, nodeRefs]);

  if (size.width === 0 || size.height === 0) return null;

  return (
    <svg
      aria-hidden="true"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-visible sm:block"
    >
      <defs>
        <filter
          id="club-map-pulse-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edges.map((edge, idx) => {
        const isHighlighted = highlightedEdgeIds.has(edge.id);
        const strokeColor = edge.unlocked
          ? ACCENT_HEX[edge.accent]
          : LOCKED_STROKE;
        const strokeOpacity = edge.unlocked
          ? isHighlighted
            ? 0.92
            : 0.28
          : isHighlighted
            ? 0.65
            : 0.38;
        const strokeWidth = isHighlighted ? 2 : edge.unlocked ? 1.35 : 1.1;

        return (
          <g key={edge.id}>
            <path
              d={edge.d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              strokeDasharray={edge.unlocked ? undefined : "4 4"}
              strokeLinecap="round"
            />

            {edge.unlocked && (
              <>
                <circle
                  cx={edge.x1}
                  cy={edge.y1}
                  r={isHighlighted ? 3 : 2}
                  fill={strokeColor}
                  fillOpacity={isHighlighted ? 0.95 : 0.45}
                />
                <circle
                  cx={edge.x2}
                  cy={edge.y2}
                  r={isHighlighted ? 3 : 2}
                  fill={strokeColor}
                  fillOpacity={isHighlighted ? 0.95 : 0.45}
                />
              </>
            )}

            {edge.unlocked && isHighlighted && !prefersReducedMotion && (
              <circle
                r="3.2"
                fill={strokeColor}
                filter="url(#club-map-pulse-glow)"
              >
                <animateMotion
                  dur={`${1.9 + (idx % 3) * 0.35}s`}
                  repeatCount="indefinite"
                  path={edge.d}
                />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}
