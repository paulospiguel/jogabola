"use client";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast-custom";
import { cn } from "@/utils";
import { Loader2, LocateFixed, MapPin, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EventFiltersModal } from "./event-filters-modal";

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface SearchFilters {
  location?: string;
  gameStyle?: string;
  dateRange?: DateRange;
  radius?: number;
  language?: string;
  eventTypes?: string[];
  experienceLevel?: string;
  priceRange?: [number, number];
  timeOfDay?: string;
  hasParking?: boolean;
  isIndoor?: boolean;
  allowsSpectators?: boolean;
}

interface EventSearchProps {
  onFiltersChange?: (filters: SearchFilters) => void;
  showTeamFilters?: boolean;
}

export function EventSearch({
  onFiltersChange,
  showTeamFilters = true,
}: EventSearchProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [gameStyle, setGameStyle] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    radius?: number;
    language?: string;
    eventTypes?: string[];
    experienceLevel?: string;
    priceRange?: [number, number];
    timeOfDay?: string;
    hasParking?: boolean;
    isIndoor?: boolean;
    allowsSpectators?: boolean;
  }>({});

  const handleSearch = () => {
    const filters: SearchFilters = {
      location: location || undefined,
      gameStyle: gameStyle || undefined,
      dateRange: dateRange || undefined,
      ...advancedFilters,
    };

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        if (key === "dateRange" && value) {
          const range = value as DateRange;
          if (range.from) params.append("startDate", range.from.toISOString());
          if (range.to) params.append("endDate", range.to.toISOString());
        } else if (Array.isArray(value)) {
          params.append(key, value.join(","));
        } else {
          params.append(key, String(value));
        }
      }
    });

    router.push(`/playzone/search?${params.toString()}`);
  };

  const handleFiltersChange = (filters: {
    radius?: number;
    language?: string;
    eventTypes?: string[];
    experienceLevel?: string;
    priceRange?: [number, number];
    timeOfDay?: string;
    hasParking?: boolean;
    isIndoor?: boolean;
    allowsSpectators?: boolean;
  }) => {
    setAdvancedFilters(filters);
    if (onFiltersChange) {
      onFiltersChange({
        location,
        gameStyle,
        dateRange,
        ...filters,
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocalização não suportada",
        "Seu navegador não suporta geolocalização.",
      );
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Usar a API de geocodificação reversa do navegador ou uma API externa
      // Vou usar a API Nominatim (OpenStreetMap) que é gratuita
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Jogabola App", // Requerido pela API Nominatim
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao obter endereço");
      }

      const data = await response.json();

      // Construir o endereço a partir dos dados retornados
      const addressParts = [];
      if (data.address) {
        if (data.address.city || data.address.town || data.address.village) {
          addressParts.push(
            data.address.city || data.address.town || data.address.village,
          );
        }
        if (data.address.state || data.address.region) {
          addressParts.push(data.address.state || data.address.region);
        }
        if (data.address.country) {
          addressParts.push(data.address.country);
        }
      }

      const address =
        addressParts.length > 0
          ? addressParts.join(", ")
          : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setLocation(address);
      toast.success(
        "Localização obtida",
        "Sua localização atual foi definida com sucesso.",
      );
    } catch (error: unknown) {
      console.error("Erro ao obter localização:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geoError = error as any; // GeolocationPositionError might not be globally available or has different shape
      if (geoError.code === 1) {
        toast.error(
          "Permissão negada",
          "Por favor, permita o acesso à localização nas configurações do navegador.",
        );
      } else if (geoError.code === 2) {
        toast.error(
          "Localização não disponível",
          "Verifique se o GPS está ativado.",
        );
      } else if (geoError.code === 3) {
        toast.error(
          "Tempo esgotado",
          "Tente novamente para obter sua localização.",
        );
      } else {
        toast.error(
          "Erro ao obter localização",
          "Ocorreu um erro ao tentar obter sua localização. Tente novamente.",
        );
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <MapPin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Localização"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="relative z-10 h-12 bg-white/5 pr-10 !pl-10 text-white"
          />
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className={cn(
              "text-muted-foreground hover:text-foreground absolute top-1/2 right-0 z-20 -translate-y-1/2 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              !location && "animate-pulse",
            )}
            aria-label="Usar localização atual"
            title="Usar localização atual"
          >
            {isGettingLocation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LocateFixed className="text-neon-secondary h-5 w-5" />
            )}
          </button>
        </div>

        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          placeholder="Selecione as datas"
          className="h-12"
        />

        {showTeamFilters && (
          <Select value={gameStyle} onValueChange={setGameStyle}>
            <SelectTrigger className="h-12 bg-white/5 text-white">
              <SelectValue placeholder="Estilo de jogo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="competitivo">Competitivo</SelectItem>
              <SelectItem value="recreativo">Recreativo</SelectItem>
              <SelectItem value="misto">Misto</SelectItem>
            </SelectContent>
          </Select>
        )}
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
          Filtros Avançados
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
