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
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <Image
              src={option.icon}
              alt={option.title}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{option.title}</h3>
            {/* Exibir descrição como tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              {option.description.split(", ").map((tag, index) => (
                <span
                  key={index}
                  className="border-brand-green/30 bg-brand-green/10 text-brand-green rounded-full border px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-brand-green text-sm font-medium">
            Funcionalidades principais:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {option.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-[#ba93ff]"
              >
                <div className="bg-brand-green h-1.5 w-1.5 rounded-full" />
                {feature}
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
