"use client";

import { getPlayerPerformance } from "@/actions/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { RotateCcw, Flag, AlertCircle, CheckCircle2, PlayCircle, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface RadarData {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
}

interface PerformanceRadarChartProps {
  data: RadarData[];
  averageRating: number;
  playerName: string;
  league: string;
  minutesPlayed: number;
  position: string;
}

export function PerformanceRadarChart({
  data,
  averageRating,
  playerName,
  league,
  minutesPlayed,
  position,
}: PerformanceRadarChartProps) {
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 60;

  // Calcular posições dos pontos no radar
  const getPointPosition = (index: number, total: number, value: number, maxValue: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Começar do topo
    const normalizedValue = value / maxValue;
    const distance = radius * normalizedValue;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Gerar pontos para o polígono
  const polygonPoints = data
    .map((item, index) => {
      const pos = getPointPosition(index, data.length, item.value, item.maxValue);
      return `${pos.x},${pos.y}`;
    })
    .join(" ");

  // Gerar pontos para as linhas de grade
  const gridLines = Array.from({ length: 3 }, (_, i) => {
    const gridRadius = (radius * (i + 1)) / 3;
    const points = data
      .map((_, index) => {
        const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
        const x = center + gridRadius * Math.cos(angle);
        const y = center + gridRadius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
    return points;
  });

  // Gerar posições dos labels
  const labelPositions = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const labelRadius = radius + 45;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y, angle, ...item };
  });

  return (
    <div className="space-y-6">
      {/* Header com informações do jogador */}
      <div className="space-y-2">
        <p className="text-base text-text-secondary">How good is?</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{playerName}</h2>
          <div className="flex items-center gap-2">
            <span className="text-base text-text-primary font-medium">{league}</span>
            <div className="h-8 w-8 rounded bg-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">PL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Radar */}
      <div className="relative flex items-center justify-center py-8">
        <div className="relative">
          <svg width={size} height={size} className="overflow-visible">
            {/* Linhas de grade concêntricas */}
            {gridLines.map((points, i) => (
              <polygon
                key={i}
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-300 dark:text-slate-600"
              />
            ))}

            {/* Linhas radiais */}
            {data.map((_, index) => {
              const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-300 dark:text-slate-600"
                />
              );
            })}

            {/* Polígono de dados */}
            <polygon
              points={polygonPoints}
              fill="rgba(255, 255, 255, 0.4)"
              stroke="white"
              strokeWidth="2.5"
              className="dark:fill-white/25 dark:stroke-white"
            />

          {/* Labels e ícones */}
          {labelPositions.map((item, index) => {
            return (
              <g key={index}>
                <foreignObject
                  x={item.x - 60}
                  y={item.y - 25}
                  width="120"
                  height="50"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="text-slate-700 dark:text-white flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap text-center">
                      {item.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Rating médio no centro */}
          <foreignObject x={center - 50} y={center - 20} width="100" height="40">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{averageRating}</p>
              <p className="text-sm text-text-secondary uppercase tracking-wide font-medium">AVG</p>
            </div>
          </foreignObject>
          </svg>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="space-y-2">
        <p className="text-2xl font-semibold text-emerald-500 dark:text-emerald-400">
          {minutesPlayed} Minutes played
        </p>
        <p className="text-base text-text-secondary">- {position}</p>
      </div>
    </div>
  );
}

// Componente de Performance completo
export function PerformanceTab() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("general");
  const [performanceData, setPerformanceData] = useState<{
    playerName: string;
    league: string;
    position: string;
    minutesPlayed: number;
    averageRating: number;
    stats: {
      started: number;
      goals: number;
      yellowCards: number;
      ended: number;
      aboutToStart: number;
      halftimeScore: number;
      redCards: number;
    };
    competitions: Array<{ id: string; name: string }>;
    selectedCompetitionId: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadPerformance() {
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const competitionId = selectedCompetition === "general" ? undefined : selectedCompetition;
        const result = await getPlayerPerformance(userId, competitionId);
        if (result.success && result.data) {
          setPerformanceData(result.data);
        }
      } catch (error) {
        console.error("Error loading performance data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPerformance();
  }, [session?.user?.id, selectedCompetition]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-400/40 border-t-emerald-500 dark:border-[#6fffe9]/30 dark:border-t-[#6fffe9]" />
          <p className="text-base text-text-secondary">Carregando dados de performance...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-base text-text-secondary">
          Não foi possível carregar os dados de performance.
        </p>
      </div>
    );
  }

  // Garantir que competitions existe
  const competitions = performanceData.competitions || [];

  // Converter dados para formato do radar
  const radarData: RadarData[] = [
    {
      label: "Started",
      value: performanceData.stats.started,
      maxValue: 10,
      icon: <RotateCcw className="h-4 w-4" />,
    },
    {
      label: "Golas",
      value: performanceData.stats.goals,
      maxValue: 10,
      icon: <Flag className="h-4 w-4" />,
    },
    {
      label: "Yellow C.",
      value: performanceData.stats.yellowCards,
      maxValue: 10,
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    },
    {
      label: "Ended",
      value: performanceData.stats.ended,
      maxValue: 10,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: "About to Start",
      value: performanceData.stats.aboutToStart,
      maxValue: 10,
      icon: <PlayCircle className="h-4 w-4" />,
    },
    {
      label: "Halftime Score",
      value: performanceData.stats.halftimeScore,
      maxValue: 10,
      icon: <Star className="h-4 w-4" />,
    },
    {
      label: "Red C.",
      value: performanceData.stats.redCards,
      maxValue: 10,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dropdown de seleção de competição */}
      <div className="flex items-center justify-between">
        <label htmlFor="competition-select" className="text-base font-semibold text-text-primary">
          Competição:
        </label>
        <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
          <SelectTrigger 
            id="competition-select"
            className="w-[250px] border-emerald-100 bg-white text-slate-700 placeholder:text-slate-400 hover:bg-emerald-50/70 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:hover:bg-white/10 dark:focus:border-[#24ffe6] dark:focus:ring-[#24ffe6]/20"
          >
            <SelectValue placeholder="Selecione uma competição" />
          </SelectTrigger>
          <SelectContent className="border-emerald-100 bg-white text-slate-700 backdrop-blur dark:border-white/10 dark:bg-[#0b1933] dark:text-white">
            <SelectItem 
              value="general"
              className="text-slate-700 hover:bg-emerald-50/80 focus:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
            >
              Geral (Média)
            </SelectItem>
            {competitions.map(competition => (
              <SelectItem 
                key={competition.id}
                value={competition.id}
                className="text-slate-700 hover:bg-emerald-50/80 focus:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
              >
                {competition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PerformanceRadarChart
        data={radarData}
        averageRating={performanceData.averageRating}
        playerName={performanceData.playerName}
        league={performanceData.league}
        minutesPlayed={performanceData.minutesPlayed}
        position={performanceData.position}
      />
    </div>
  );
}

