"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  className?: string;
}

export function PricingCard({
  tier,
  name,
  price,
  period,
  features,
  cta,
  isPopular,
  className,
}: PricingCardProps) {
  const t = useTranslations("plansPage");
  const isFree = price.toLowerCase() === "free";
  const currency = "€";

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/5 backdrop-blur-xl transition-all duration-300",
        isPopular &&
          "border-neon-secondary/50 shadow-[0_0_40px_-15px_rgba(36,255,230,0.3)] scale-105 z-10",
        !isPopular && "hover:border-white/20",
        className,
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 left-0 flex justify-center">
          <span className="bg-neon-secondary px-4 py-1 text-[10px] font-bold tracking-widest text-toast-bg rounded-b-lg">
            {t("mostPopular")}
          </span>
        </div>
      )}

      <CardHeader className="pt-10 pb-6 text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] text-neon-primary/70 uppercase mb-2">
          TIER: {tier}
        </span>
        <h3 className="text-3xl font-bold text-white mb-4">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          {!isFree && (
            <span className="text-lg font-medium text-white/60">
              {currency}
            </span>
          )}
          <span className="text-5xl font-black text-white">{price}</span>
          {period && (
            <span className="text-sm font-medium text-white/60">{period}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-10 px-8">
        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-neon-secondary" />
              <span className="text-sm text-white/80 leading-relaxed font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="px-8 pb-8">
        <Button
          className={cn(
            "w-full h-12 rounded-xl font-bold tracking-wider transition-all duration-300",
            isPopular
              ? "bg-neon-secondary text-toast-bg shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] hover:scale-[1.02] hover:bg-neon-secondary/90"
              : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30",
          )}
          variant={isPopular ? "default" : "outline"}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
