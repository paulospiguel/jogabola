import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FloatingOrbProps {
  delay: number;
  size: number;
  position: string;
}

export function FloatingOrb({ delay, size, position }: FloatingOrbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0],
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
      className={cn(
        "absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl",
        position,
      )}
      style={{ width: size, height: size }}
    />
  );
}
