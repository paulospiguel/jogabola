import { cn } from "@/lib/utils";
import { JourneyOption } from "@/types/welcome";
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
          ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/5 shadow-lg shadow-[#00cfb1]/25"
          : "border-white/20 bg-gradient-to-br from-white/5 to-white/2 hover:border-[#00cfb1]/50",
      )}
      onClick={() => onSelect(option.id)}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r",
              option.color,
            )}
          >
            <Image
              src={option.icon}
              alt={option.title}
              width={24}
              height={24}
              className="invert"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{option.title}</h3>
            <p className="text-sm text-[#ba93ff]">{option.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[#00cfb1]">
            Funcionalidades principais:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {option.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-[#ba93ff]"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#00cfb1]" />
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
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#00cfb1]"
        >
          <CheckCircle className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
