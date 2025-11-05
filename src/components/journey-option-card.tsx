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
        "relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300",
        isSelected
          ? "border-brand-green from-brand-green/10 shadow-brand-green/25 bg-linear-to-br to-[#1effbf]/5 shadow-lg"
          : "hover:border-brand-green/50 border-white/20 bg-linear-to-br from-white/5 to-white/2",
      )}
      onClick={() => onSelect(option.id)}
    >
      <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-16 sm:w-16">
            <Image
              src={option.icon}
              alt={option.title}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white sm:text-xl">{option.title}</h3>
            {/* Exibir descrição como tags */}
            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {option.description.split(", ").map((tag, index) => (
                <span
                  key={index}
                  className="border-brand-green/30 bg-brand-green/10 text-brand-green rounded-full border px-2 py-0.5 text-xs font-medium sm:px-3 sm:py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-brand-green text-xs font-medium sm:text-sm">
            Funcionalidades principais:
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
            {option.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-[#ba93ff] sm:text-sm"
              >
                <div className="bg-brand-green h-1.5 w-1.5 shrink-0 rounded-full" />
                <span className="break-words">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-brand-green absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full"
        >
          <CheckCircle className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
