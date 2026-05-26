import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { SegmentedControl } from "@/components/arena/segmented-control";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ViewMode } from "../_types/calendar-events";

interface CalendarControlsProps {
  ariaLabel: string;
  customRange: DateRange | undefined;
  eventCountLabel: string;
  isPending: boolean;
  navLabel: string;
  navigate: (direction: "prev" | "next") => void;
  noEventsLabel: string;
  onRangeChange: (range: DateRange | undefined) => void;
  onViewModeChange: (mode: ViewMode) => void;
  prevLabel: string;
  rangeOpen: boolean;
  rangePlaceholder: string;
  setRangeOpen: (open: boolean) => void;
  nextLabel: string;
  totalEvents: number;
  viewMode: ViewMode;
  viewOptions: Array<{ id: ViewMode; label: string }>;
}

export function CalendarControls({
  ariaLabel,
  customRange,
  eventCountLabel,
  isPending,
  navLabel,
  navigate,
  noEventsLabel,
  onRangeChange,
  onViewModeChange,
  prevLabel,
  rangeOpen,
  rangePlaceholder,
  setRangeOpen,
  nextLabel,
  totalEvents,
  viewMode,
  viewOptions,
}: CalendarControlsProps) {
  return (
    <>
      <div className="mb-4 flex">
        <SegmentedControl
          ariaLabel={ariaLabel}
          onChange={onViewModeChange}
          options={viewOptions}
          value={viewMode}
        />
      </div>

      {viewMode !== "range" && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-5"
          style={{
            backgroundColor: "var(--color-arena-surface)",
            border: "1px solid var(--color-arena-border)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("prev")}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text transition-colors disabled:opacity-40"
            aria-label={prevLabel}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[13px] font-bold text-arena-text">
              {navLabel}
            </span>
            <span className="text-[11px] text-arena-text-muted">
              {totalEvents === 0 ? noEventsLabel : eventCountLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("next")}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text transition-colors disabled:opacity-40"
            aria-label={nextLabel}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {viewMode === "range" && (
        <div className="mb-5 flex flex-col gap-2">
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-arena-surface-el w-full"
                style={{
                  backgroundColor: "var(--color-arena-surface)",
                  border: "1px solid var(--color-arena-border)",
                }}
              >
                <Calendar size={16} className="text-arena-primary shrink-0" />
                <span className="text-arena-text flex-1 text-left">
                  {customRange?.from && customRange?.to
                    ? navLabel
                    : rangePlaceholder}
                </span>
                <ChevronRight size={14} className="text-arena-text-muted" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
              style={{
                backgroundColor: "var(--color-arena-surface)",
                border: "1px solid var(--color-arena-border)",
              }}
            >
              <CalendarPicker
                mode="range"
                selected={customRange}
                onSelect={range => {
                  onRangeChange(range);
                  if (range?.from && range?.to) {
                    setRangeOpen(false);
                  }
                }}
                numberOfMonths={2}
                weekStartsOn={1}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
          {customRange?.from && customRange?.to && (
            <p className="text-[11px] text-arena-text-muted px-1">
              {totalEvents === 0 ? noEventsLabel : eventCountLabel}
            </p>
          )}
        </div>
      )}
    </>
  );
}
