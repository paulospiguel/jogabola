import { cn } from "@/lib/utils";
import { JourneyOption } from "@/types/onboard";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronRight, Sparkles, Tag, Zap } from "lucide-react";
import Image from "next/image";

interface JourneyOptionCardProps {
  option: JourneyOption;
  isSelected: boolean;
  isFocused?: boolean;
  onSelect: (id: string) => void;
  onToggleFocus?: () => void;
  index: number;
}

export function JourneyOptionCard({
  option,
  isSelected,
  isFocused = false,
  onSelect,
  onToggleFocus,
  index,
}: JourneyOptionCardProps) {
  const showExpanded = isSelected && isFocused;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: isFocused ? 0 : index * 0.1,
        layout: { duration: 0.4, type: "spring", stiffness: 300, damping: 30 },
      }}
      onClick={() => !isFocused && onSelect(option.id)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm transition-all duration-300",
        isFocused
          ? "border-neon-primary cursor-default bg-transparent shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)]"
          : "hover:border-neon-primary/50 cursor-pointer",
        !isFocused && isSelected ? "border-neon-primary bg-white/10" : "",
      )}
    >
      <div
        className={cn(
          "transition-all duration-300",
          showExpanded ? "p-6 sm:p-8" : "p-4 sm:p-5",
        )}
      >
        {/* Header Section */}
        <motion.div
          layout="position"
          className="flex items-center gap-3 sm:gap-4"
        >
          {/* Icon */}
          <motion.div
            layout
            className={cn(
              "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl transition-all duration-300",
              showExpanded
                ? "h-16 w-16 bg-emerald-500/25 ring-4 ring-emerald-500/30"
                : isSelected
                  ? "h-14 w-14 bg-emerald-500/20 ring-2 ring-emerald-500/30"
                  : "h-12 w-12 bg-white/10 group-hover:bg-white/15",
            )}
          >
            <Image
              src={option.icon}
              alt={option.title}
              width={120}
              height={120}
              className="object-contain p-1"
            />
          </motion.div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <motion.h3
              layout="position"
              className={cn(
                "font-bold transition-all duration-300",
                showExpanded
                  ? "text-xl text-white sm:text-2xl"
                  : isSelected
                    ? "text-lg text-emerald-400 sm:text-xl"
                    : "text-base text-white group-hover:text-emerald-300 sm:text-lg",
              )}
            >
              {option.title}
            </motion.h3>

            <AnimatePresence mode="wait">
              {!showExpanded && !isSelected && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="mt-0.5 text-xs text-gray-400 group-hover:text-gray-300"
                >
                  Clica para selecionar
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Selection Indicator or Close Button */}
          {!isFocused && (
            <motion.div layout className="shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  isSelected
                    ? "h-7 w-7 border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                    : "h-6 w-6 border-white/20 text-white/30 group-hover:border-emerald-500/50 group-hover:text-emerald-500/50",
                )}
              >
                {isSelected ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Expanded Content - Only in Focus Mode */}
        <AnimatePresence mode="wait">
          {showExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-5">
                {/* Animated Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-px origin-left bg-gradient-to-r from-emerald-500/60 via-emerald-500/30 to-transparent"
                />

                {/* Características Section */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-3 flex items-center gap-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Tag className="h-3.5 w-3.5 text-emerald-200" />
                    </div>
                    <p className="text-sm font-bold tracking-wider text-white uppercase">
                      Características
                    </p>
                  </motion.div>
                  <div className="flex flex-wrap gap-2">
                    {option.tags.map((tag, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: 0.2 + idx * 0.05,
                          type: "spring",
                          stiffness: 300,
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-100 backdrop-blur-sm"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-200" />
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Funcionalidades Section */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-3 flex items-center gap-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                      Funcionalidades
                    </p>
                  </motion.div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {option.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + idx * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="group/item flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 backdrop-blur-sm transition-colors hover:bg-black/30"
                      >
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] ring-2 ring-emerald-500/20" />
                        <span className="text-sm leading-snug text-gray-300 group-hover/item:text-white">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glow effect when selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"
        />
      )}
    </motion.div>
  );
}
