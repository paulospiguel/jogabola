"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Shield,
  Zap,
  Heart
} from "lucide-react";

interface EventFiltersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    radius?: number;
    language?: string;
    eventTypes?: string[];
    experienceLevel?: string;
    priceRange?: [number, number];
    timeOfDay?: string;
    hasParking?: boolean;
    isIndoor?: boolean;
    allowsSpectators?: boolean;
  };
  onFiltersChange: (filters: {
    radius?: number;
    language?: string;
    eventTypes?: string[];
    experienceLevel?: string;
    priceRange?: [number, number];
    timeOfDay?: string;
    hasParking?: boolean;
    isIndoor?: boolean;
    allowsSpectators?: boolean;
  }) => void;
}

export function EventFiltersModal({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
}: EventFiltersModalProps) {
  const [radius, setRadius] = useState(filters.radius || 10);
  const [language, setLanguage] = useState(filters.language || "");
  const [eventTypes, setEventTypes] = useState<string[]>(filters.eventTypes || []);
  const [experienceLevel, setExperienceLevel] = useState(filters.experienceLevel || "");
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange || [0, 100]);
  const [timeOfDay, setTimeOfDay] = useState(filters.timeOfDay || "");
  const [hasParking, setHasParking] = useState(filters.hasParking || false);
  const [isIndoor, setIsIndoor] = useState(filters.isIndoor || false);
  const [allowsSpectators, setAllowsSpectators] = useState(filters.allowsSpectators || false);

  useEffect(() => {
    setRadius(filters.radius || 10);
    setLanguage(filters.language || "");
    setEventTypes(filters.eventTypes || []);
    setExperienceLevel(filters.experienceLevel || "");
    setPriceRange(filters.priceRange || [0, 100]);
    setTimeOfDay(filters.timeOfDay || "");
    setHasParking(filters.hasParking || false);
    setIsIndoor(filters.isIndoor || false);
    setAllowsSpectators(filters.allowsSpectators || false);
  }, [filters]);

  const toggleEventType = (type: string) => {
    setEventTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleApply = () => {
    onFiltersChange({
      radius: radius > 0 ? radius : undefined,
      language: language || undefined,
      eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
      experienceLevel: experienceLevel || undefined,
      priceRange: priceRange[0] > 0 || priceRange[1] < 100 ? priceRange : undefined,
      timeOfDay: timeOfDay || undefined,
      hasParking: hasParking || undefined,
      isIndoor: isIndoor || undefined,
      allowsSpectators: allowsSpectators || undefined,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setRadius(10);
    setLanguage("");
    setEventTypes([]);
    setExperienceLevel("");
    setPriceRange([0, 100]);
    setTimeOfDay("");
    setHasParking(false);
    setIsIndoor(false);
    setAllowsSpectators(false);
    onFiltersChange({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0b1933] border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#24ffe6]" />
            Filtros Avançados
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Personalize sua busca para encontrar o evento perfeito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold">
              <Trophy className="h-5 w-5" />
              <span>Tipo de Evento</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "partida", label: "Partida", icon: Trophy },
                { value: "treino", label: "Treino", icon: Target },
                { value: "grupo", label: "Grupo", icon: Users },
                { value: "torneio", label: "Torneio", icon: Trophy },
                { value: "competicao", label: "Competição", icon: Shield },
                { value: "evento", label: "Evento", icon: Calendar },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => toggleEventType(value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    eventTypes.includes(value)
                      ? "border-[#24ffe6] bg-[#24ffe6]/10 text-[#24ffe6]"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold">
              <Target className="h-5 w-5" />
              <span>Nível de Experiência</span>
            </div>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="all">Todos os níveis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold">
              <DollarSign className="h-5 w-5" />
              <span>Faixa de Preço</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">
                  €{priceRange[0]} - €{priceRange[1]}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>Grátis</span>
                <span>€100+</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold">
              <Clock className="h-5 w-5" />
              <span>Período do Dia</span>
            </div>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Manhã (06:00 - 12:00)</SelectItem>
                <SelectItem value="afternoon">Tarde (12:00 - 18:00)</SelectItem>
                <SelectItem value="evening">Noite (18:00 - 00:00)</SelectItem>
                <SelectItem value="all">Qualquer horário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold">
              <MapPin className="h-5 w-5" />
              <span>Raio de Busca</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">
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
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#24ffe6] font-semibold mb-3">
              <Heart className="h-5 w-5" />
              <span>Comodidades</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="parking" className="text-white cursor-pointer">
                  Estacionamento disponível
                </Label>
                <Switch
                  id="parking"
                  checked={hasParking}
                  onCheckedChange={setHasParking}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="indoor" className="text-white cursor-pointer">
                  Local coberto
                </Label>
                <Switch
                  id="indoor"
                  checked={isIndoor}
                  onCheckedChange={setIsIndoor}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="spectators" className="text-white cursor-pointer">
                  Permite espectadores
                </Label>
                <Switch
                  id="spectators"
                  checked={allowsSpectators}
                  onCheckedChange={setAllowsSpectators}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <Label htmlFor="language" className="text-white">Idioma preferido</Label>
            <Select value={language || "all"} onValueChange={(value) => setLanguage(value === "all" ? "" : value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
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

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Limpar Tudo
          </Button>
          <Button 
            onClick={handleApply} 
            className="bg-[#24ffe6] text-slate-900 hover:bg-[#1de5d0] font-semibold"
          >
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
