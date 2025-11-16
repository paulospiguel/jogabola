"use client";

import { EventImageCarousel } from "@/components/event-image-carousel";
import { EventSearch } from "@/components/event-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EventResult {
  id: number;
  title: string;
  type: "partida" | "treino" | "grupo";
  location: string;
  city?: string;
  startDate: string;
  gameStyle?: string;
  experienceLevel?: string;
  currentParticipants: number;
  maxParticipants?: number;
  organizerName: string;
  images?: string[];
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - substituir por chamada à API
  useEffect(() => {
    // Simular busca
    setTimeout(() => {
      setResults([
        {
          id: 1,
          title: "Pelada Dominical - Parque Central",
          type: "partida",
          location: "Parque Central",
          city: "Lisboa",
          startDate: "2024-11-17T10:00:00",
          gameStyle: "recreativo",
          experienceLevel: "intermediate",
          currentParticipants: 12,
          maxParticipants: 22,
          organizerName: "João Silva",
          images: [
            "/images/login-stadium.jpg",
            "/temp/barreiro.jpg",
            "/temp/bolacacem.jpg",
          ],
        },
        {
          id: 2,
          title: "Treino Técnico - Campo Municipal",
          type: "treino",
          location: "Campo Municipal",
          city: "Porto",
          startDate: "2024-11-15T18:00:00",
          gameStyle: "competitivo",
          experienceLevel: "advanced",
          currentParticipants: 8,
          maxParticipants: 16,
          organizerName: "Maria Santos",
          images: ["/images/login-stadium.jpg", "/temp/barreiro.jpg"],
        },
        {
          id: 3,
          title: "Grupo de Futebol Amador",
          type: "grupo",
          location: "Arena Sports",
          city: "Braga",
          startDate: "2024-11-20T19:00:00",
          gameStyle: "misto",
          experienceLevel: "beginner",
          currentParticipants: 15,
          maxParticipants: 20,
          organizerName: "Pedro Costa",
          images: ["/images/login-stadium.jpg"],
        },
      ]);
      setLoading(false);
    }, 500);
  }, [searchParams]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      partida: "Partida",
      treino: "Treino",
      grupo: "Grupo",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    if (type === "partida") return Trophy;
    if (type === "treino") return Target;
    return Users;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050312] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />

      <main className="container mx-auto px-4 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <motion.header
          className="mb-8 flex items-center gap-4"
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Resultados da busca
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              {results.length}{" "}
              {results.length === 1
                ? "resultado encontrado"
                : "resultados encontrados"}
            </p>
          </div>
        </motion.header>

        {/* Busca */}
        <motion.div
          className="mb-8"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <EventSearch />
        </motion.div>

        {/* Resultados */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9] border-t-transparent" />
              <p className="text-text-secondary">Buscando eventos...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <motion.div
            className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12"
            variants={fadeUp}
            initial="initial"
            animate="animate"
          >
            <p className="text-text-secondary text-lg">
              Nenhum resultado encontrado
            </p>
            <p className="text-text-secondary mt-2 text-sm">
              Tente ajustar os filtros de busca
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((event, index) => {
              const TypeIcon = getTypeIcon(event.type);
              return (
                <motion.div
                  key={event.id}
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group h-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/6 transition-all duration-300 hover:border-[#24ffe6]/40 hover:bg-white/10 hover:shadow-[0_20px_50px_-20px_rgba(36,255,230,0.3)]">
                    <Link href={`/playzone/events/${event.id}`}>
                      {/* Carrossel de imagens */}
                      <EventImageCarousel
                        images={event.images || []}
                        alt={event.title}
                        showControls={event.images && event.images.length > 1}
                      />
                    </Link>
                    <CardContent className="p-6">
                      <Link href={`/playzone/events/${event.id}`}>
                        <div className="space-y-4">
                          {/* Tipo e título */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-5 w-5 text-[#24ffe6]" />
                              <span className="text-xs font-semibold tracking-wider text-[#24ffe6] uppercase">
                                {getTypeLabel(event.type)}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-white">
                            {event.title}
                          </h3>

                          {/* Informações */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="h-4 w-4 text-[#24ffe6]" />
                              <span>{event.location}</span>
                              {event.city && (
                                <span className="text-white/60">
                                  • {event.city}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-white/80">
                              <CalendarDays className="h-4 w-4 text-[#24ffe6]" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-white/80">
                              <Users className="h-4 w-4 text-[#24ffe6]" />
                              <span>
                                {event.currentParticipants}
                                {event.maxParticipants &&
                                  ` / ${event.maxParticipants}`}{" "}
                                participantes
                              </span>
                            </div>

                            {event.gameStyle && (
                              <div className="flex items-center gap-2 text-white/80">
                                <Clock className="h-4 w-4 text-[#24ffe6]" />
                                <span className="capitalize">
                                  {event.gameStyle}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Organizador */}
                          <div className="border-t border-white/10 pt-4">
                            <p className="text-xs text-white/60">
                              Organizado por{" "}
                              <span className="font-medium text-white">
                                {event.organizerName}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
