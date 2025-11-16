"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface EventFiltersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    radius?: number;
    language?: string;
  };
  onFiltersChange: (filters: { radius?: number; language?: string }) => void;
}

export function EventFiltersModal({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
}: EventFiltersModalProps) {
  const [radius, setRadius] = useState(filters.radius || 10);
  const [language, setLanguage] = useState(filters.language || "");

  useEffect(() => {
    setRadius(filters.radius || 10);
    setLanguage(filters.language || "");
  }, [filters]);

  const handleApply = () => {
    onFiltersChange({
      radius: radius > 0 ? radius : undefined,
      language: language || undefined,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setRadius(10);
    setLanguage("");
    onFiltersChange({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0b1933] border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Configurações de Filtros</DialogTitle>
          <DialogDescription className="text-white/70">
            Configure os filtros avançados para refinar sua busca
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Raio de busca */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="radius" className="text-white">Raio de busca</Label>
              <span className="text-sm font-medium text-white">
                {radius} km
              </span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Idioma */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-white">Idioma preferido</Label>
            <Select value={language || "all"} onValueChange={(value) => setLanguage(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os idiomas</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>
            Limpar
          </Button>
          <Button onClick={handleApply} className="bg-neon-secondary text-slate-900">
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

