"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialProgressIconProps {
  progress: number; // Valor de 0 a 100
  valueText?: string; // Texto numérico a exibir internamente no centro
  size?: number | string; // Tamanho do ícone (largura/altura)
  strokeWidth?: number; // Espessura da linha do círculo
  className?: string;
}

export function RadialProgressIcon({
  progress,
  valueText,
  size = 28,
  strokeWidth = 2,
  className,
}: RadialProgressIconProps) {
  // Normalizar progresso entre 0 e 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // Raio do círculo (com base em viewBox 24x24)
  const radius = 9.5;
  // Perímetro do círculo
  const circumference = 2 * Math.PI * radius;
  // Offset para simular o preenchimento no sentido dos ponteiros do relógio
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const isZero = normalizedProgress === 0;
  const isFull = normalizedProgress === 100;

  // Lógica de Cores por Escala (Vermelho, Amarelo, Verde Neon)
  let strokeColor = "#7CFF4F"; // Verde Neon (Excelente >= 61% / rating >= 6.1)
  let trackClass = "text-arena-primary/10";
  
  if (isZero) {
    strokeColor = "#6B7280"; // Cinza se for 0%
    trackClass = "text-arena-text-muted/20";
  } else if (normalizedProgress <= 40) {
    strokeColor = "#EF4444"; // Vermelho (Baixo: 0.1% a 40% / rating <= 4)
    trackClass = "text-arena-danger/10";
  } else if (normalizedProgress <= 60) {
    strokeColor = "#F59E0B"; // Amarelo (Médio: 41% a 60% / rating 4.1 a 6)
    trackClass = "text-arena-warning/10";
  }

  return (
    <div 
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("w-full h-full shrink-0 select-none overflow-visible", className)}
        aria-valuenow={normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        {/* Círculo de Fundo (Pista/Track) */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn("transition-colors duration-300", trackClass)}
        />
        
        {/* Círculo de Progresso Ativo (Preenchimento Estilo Relógio) */}
        {!isZero && (
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 12 12)" // Iniciar do topo (12 horas)
            className={cn(
              "transition-all duration-300 ease-out",
              isFull ? "drop-shadow-[0_0_3px_rgba(124,255,79,0.4)]" : ""
            )}
          />
        )}

        {/* Texto do Número Interno ao Progresso */}
        {valueText && (
          <text
            x="12"
            y="12.5" // Pequeno offset para alinhamento vertical ótico da fonte
            textAnchor="middle"
            dominantBaseline="central"
            fill={strokeColor}
            className="font-bold select-none tracking-tighter"
            style={{ 
              fontSize: valueText.length > 2 ? "6px" : "7px", 
              fontFamily: "Inter, Sora, sans-serif" 
            }}
          >
            {valueText}
          </text>
        )}

        {/* Indicador de pulsação central apenas se estiver 100% concluído e sem texto interno */}
        {isFull && !valueText && (
          <circle
            cx="12"
            cy="12"
            r={2}
            fill="#7CFF4F"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}
