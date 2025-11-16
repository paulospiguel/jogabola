"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EventFiltersModal } from "./event-filters-modal";

interface SearchFilters {
  location?: string;
  gameStyle?: string;
  startDate?: string;
  endDate?: string;
  radius?: number;
  language?: string;
}

interface EventSearchProps {
  onFiltersChange?: (filters: SearchFilters) => void;
}

export function EventSearch({ onFiltersChange }: EventSearchProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [gameStyle, setGameStyle] = useState<string | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    radius?: number;
    language?: string;
  }>({});

  const handleSearch = () => {
    const filters: SearchFilters = {
      location: location || undefined,
      gameStyle: gameStyle || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      ...advancedFilters,
    };

    // Construir query string
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    // Navegar para página de resultados
    router.push(`/playzone/search?${params.toString()}`);
  };

  const handleFiltersChange = (filters: {
    radius?: number;
    language?: string;
  }) => {
    setAdvancedFilters(filters);
    if (onFiltersChange) {
      onFiltersChange({
        location,
        gameStyle,
        startDate,
        endDate,
        ...filters,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Localização */}
        <div className="relative">
          <MapPin className="text-muted-foreground absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Localização"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="pr-4 !pl-10"
          />
        </div>

        {/* Estilo de jogo */}
        <Select value={gameStyle} onValueChange={setGameStyle}>
          <SelectTrigger>
            <SelectValue placeholder="Estilo de jogo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="competitivo">Competitivo</SelectItem>
            <SelectItem value="recreativo">Recreativo</SelectItem>
            <SelectItem value="misto">Misto</SelectItem>
          </SelectContent>
        </Select>

        {/* Data inicial */}
        <Input
          type="date"
          placeholder="Data inicial"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        {/* Data final */}
        <Input
          type="date"
          placeholder="Data final"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSearch}
          className="bg-neon-secondary hover:bg-neon-secondary/90 min-w-[200px] font-semibold text-slate-900"
        >
          <Search className="mr-2 h-5 w-5" />
          Buscar
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowFiltersModal(true)}
          className="border-2 border-white/25 bg-white/10 text-white hover:bg-white/20"
        >
          <Settings className="mr-2 h-5 w-5" />
          Filtros
        </Button>
      </div>

      <EventFiltersModal
        isOpen={showFiltersModal}
        onOpenChange={setShowFiltersModal}
        filters={advancedFilters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
