"use client";

import { Sparkles } from "lucide-react";

interface AiSummarySectionProps {
  summary: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function AiSummarySection({
  summary,
  isGenerating,
  onGenerate,
}: AiSummarySectionProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
          <Sparkles size={14} className="text-purple-400" />
          AI Analysis
        </h3>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-900/20 transition-colors select-none hover:bg-purple-500 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Analyze Match"}
        </button>
      </div>

      {summary && (
        <div className="prose prose-invert prose-sm max-w-none rounded-xl border border-slate-800/50 bg-slate-950 p-4 text-sm leading-relaxed">
          {summary.split("\n").map((line, i) => (
            <p key={`summary-line-${i}`} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
