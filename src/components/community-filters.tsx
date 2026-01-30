"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CommunityFiltersProps {
  categoryLabel: string;
  locationLabel: string;
  availabilityLabel: string;
  dateLabel: string;
  searchLabel: string;
  className?: string;
}

export function CommunityFilters({
  categoryLabel,
  locationLabel,
  availabilityLabel,
  dateLabel,
  searchLabel,
  className,
}: CommunityFiltersProps) {
  const t = useTranslations("communityPage");

  const { data: filters } = useQuery({
    queryKey: ["community-filters"],
    queryFn: () => {
      return {
        categories: ["goalkeeper", "defender", "midfielder", "forward"],
        locations: [
          "Lisboa",
          "Porto",
          "Faro",
          "Coimbra",
          "Braga",
          "Madeira",
          "Açores",
          "Algarve",
          "Alentejo",
          "Beiras",
          "Douro",
          "Minho",
          "Trás-os-Montes",
        ],
        availabilities: ["weekdays", "weekends", "flexible"],
      };
    },
  });

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center gap-4 p-6 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm",
        className,
      )}
    >
      {/* Category Filter */}
      <div className="flex-1">
        <Select>
          <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:border-white/20 focus:border-neon-primary/50">
            <SelectValue placeholder={categoryLabel} />
          </SelectTrigger>
          <SelectContent className="bg-popover-dark border-white/10">
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            {filters?.categories.map((category) => (
              <SelectItem key={category} value={category}>
                {t(`athletes.positions.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="flex-1">
        <Select>
          <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:border-white/20 focus:border-neon-primary/50">
            <SelectValue placeholder={locationLabel} />
          </SelectTrigger>
          <SelectContent className="bg-popover-dark border-white/10">
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            {filters?.locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability Filter */}
      <div className="flex-1">
        <Select>
          <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 text-white hover:border-white/20 focus:border-neon-primary/50">
            <SelectValue placeholder={availabilityLabel} />
          </SelectTrigger>
          <SelectContent className="bg-popover-dark border-white/10">
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            {filters?.availabilities.map((availability) => (
              <SelectItem key={availability} value={availability}>
                {t(`availabilities.${availability}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Filter */}
      <div className="flex-1">
        <Input
          type="date"
          placeholder={dateLabel}
          className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40 hover:border-white/20 focus:border-neon-primary/50"
        />
      </div>

      {/* Search Button */}
      <Button className="h-12 px-8 rounded-xl bg-neon-secondary text-toast-bg font-bold tracking-wider hover:bg-neon-secondary/90 transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(36,255,230,0.5)] whitespace-nowrap">
        <Search className="mr-2 h-4 w-4" />
        {searchLabel}
      </Button>
    </div>
  );
}
