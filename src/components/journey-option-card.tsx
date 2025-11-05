import { cn } from "@/lib/utils";
import { JourneyOption } from "@/types/onboard";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

interface JourneyOptionCardProps {
  option: JourneyOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}

export function JourneyOptionCard({
  option,
  isSelected,
  onSelect,
  index,
}: JourneyOptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 transition-all duration-300",
        isSelected
          ? "border-brand-green shadow-brand-green/25 shadow-lg"
          : "border-white/20 hover:border-brand-green/80",
      )}
      onClick={() => onSelect(option.id)}
    >
      <div className={cn(
        "overflow-hidden rounded-2xl bg-linear-to-br",
        isSelected
          ? "from-brand-green/10 to-[#1effbf]/5"
          : "from-white/5 to-white/2"
      )}>
        <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-12 sm:w-12">
            <Image
              src={option.icon}
              alt={option.title}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white sm:text-base">{option.title}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1 sm:gap-1.5">
              {option.tags.map((tag, index) => (
                <span
                  key={index}
                  className="border-brand-green/30 bg-brand-green/10 text-brand-green rounded-full border px-2 py-0.5 text-xs font-medium sm:px-2.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-brand-green text-xs font-medium">
            Funcionalidades principais:
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1.5">
            {option.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-[#ba93ff]"
              >
                <div className="bg-brand-green h-1 w-1 shrink-0 rounded-full" />
                <span className="break-words">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-brand-green absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full sm:top-3 sm:right-3 sm:h-6 sm:w-6"
        >
          <CheckCircle className="h-3 w-3 text-white sm:h-4 sm:w-4" />
        </motion.div>
      )}
    </motion.div>
  );
}
