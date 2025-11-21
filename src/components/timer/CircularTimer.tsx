import React from 'react';

interface CircularTimerProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  radius?: number;
  stroke?: number;
  color?: string;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  currentTime,
  duration,
  radius = 120,
  stroke = 12,
  color = "#3b82f6" // blue-500
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculate progress inverted (timer counts up usually in soccer, but visuals can fill up)
  const progress = Math.min(currentTime / duration, 1);
  const strokeDashoffset = circumference - progress * circumference;

  // Format time MM:SS
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-500 ease-linear"
      >
        {/* Background Circle */}
        <circle
          stroke="#1e293b" // slate-800
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white font-mono tracking-widest">
          {formattedTime}
        </span>
        <span className="text-slate-400 text-sm mt-2 font-medium uppercase tracking-wider">
          Elapsed
        </span>
      </div>
    </div>
  );
};