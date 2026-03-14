"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Bell,
  CalendarDays,
  Clock,
  Euro,
  MapPin,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EventImageCarousel } from "@/components/event-image-carousel";
import { EventSearch } from "@/components/event-search";
import {
  ProtectedDashboardShell,
  ProtectedSectionCard,
} from "@/components/protected/protected-dashboard-shell";
import { ProtectedPageHeader } from "@/components/protected-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  price?: number;
  isFree?: boolean;
  prizeAmount?: number;
  prizeDescription?: string;
  isFavorited?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function SearchResultsPage() {
  const router = useRouter();
  const t = useTranslations("searchResults");
  const globalT = useTranslations();
  const [results, setResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          price: 5,
          isFree: false,
          isFavorited: false,
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
          isFree: true,
          isFavorited: true,
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
          images: [],
          price: 10,
          isFree: false,
          prizeAmount: 200,
          prizeDescription: "Troféu + €200 para o time vencedor",
          isFavorited: false,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      partida: t("eventTypes.partida"),
      treino: t("eventTypes.treino"),
      grupo: t("eventTypes.grupo"),
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
    <div className="relative flex flex-col overflow-hidden">
      <ProtectedPageHeader
        eyebrow={globalT("header.playZone")}
        title={t("title")}
        description={t("resultsFound", { count: results.length })}
      />
      <ProtectedDashboardShell contentClassName="space-y-6">
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
            {t("back")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
            <p className="text-text-secondary mt-1 text-sm">
              {t("resultsFound", { count: results.length })}
            </p>
          </div>
        </motion.header>

        {/* Busca */}
        <ProtectedSectionCard
          title={t("title")}
          description={t("searchPrompt")}
          bodyClassName="px-6 py-6"
        >
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <EventSearch />
          </motion.div>
        </ProtectedSectionCard>

        {/* Resultados */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9] border-t-transparent" />
              <p className="text-text-secondary">{t("loading")}</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <motion.div
            className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12"
            variants={fadeUp}
            initial="initial"
            animate="animate"
          >
            <p className="text-text-secondary text-lg">{t("noResults")}</p>
            <p className="text-text-secondary mt-2 text-sm">
              {t("noResultsDescription")}
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
                  <Card className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-sm transition-all duration-300 hover:border-neon-secondary/50 hover:shadow-[0_20px_50px_-20px_rgba(36,255,230,0.4)]">
                    <Link href={`/playzone/events/${event.id}`}>
                      <EventImageCarousel
                        images={event.images || []}
                        alt={event.title}
                        showControls={event.images && event.images.length > 1}
                      />
                    </Link>

                    <div className="absolute top-3 right-3 z-20 flex gap-2">
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className={`h-10 w-10 rounded-full backdrop-blur-md border transition-all ${
                          event.isFavorited
                            ? "bg-neon-secondary/20 border-neon-secondary text-neon-secondary"
                            : "bg-black/40 border-white/20 text-white hover:bg-black/60"
                        }`}
                        aria-label={
                          event.isFavorited
                            ? "Remover dos favoritos"
                            : "Adicionar aos favoritos"
                        }
                      >
                        <Star
                          className={`h-5 w-5 mx-auto ${event.isFavorited ? "fill-current" : ""}`}
                        />
                      </button>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all"
                        aria-label="Seguir organizador"
                      >
                        <Bell className="h-5 w-5 mx-auto" />
                      </button>
                    </div>

                    <CardContent className="p-6">
                      <Link href={`/playzone/events/${event.id}`}>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-neon-secondary/10 p-1.5">
                                <TypeIcon className="h-4 w-4 text-neon-secondary" />
                              </div>
                              <span className="text-xs font-bold tracking-wider text-neon-secondary uppercase">
                                {getTypeLabel(event.type)}
                              </span>
                            </div>

                            {event.prizeAmount && (
                              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
                                <Award className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-xs font-bold text-amber-400">
                                  €{event.prizeAmount}
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                            {event.title}
                          </h3>

                          <div className="space-y-2.5 text-sm">
                            <div className="flex items-center gap-2 text-white/70">
                              <MapPin className="h-4 w-4 text-neon-secondary flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                              {event.city && (
                                <span className="text-white/50">
                                  • {event.city}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-white/70">
                              <CalendarDays className="h-4 w-4 text-neon-secondary flex-shrink-0" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-white/70">
                              <Users className="h-4 w-4 text-neon-secondary flex-shrink-0" />
                              <span>
                                {event.currentParticipants}
                                {event.maxParticipants &&
                                  ` / ${event.maxParticipants}`}{" "}
                                participantes
                              </span>
                            </div>

                            {event.gameStyle && (
                              <div className="flex items-center gap-2 text-white/70">
                                <Clock className="h-4 w-4 text-neon-secondary flex-shrink-0" />
                                <span className="capitalize">
                                  {event.gameStyle}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-white/10 pt-4">
                            <div>
                              <p className="text-xs text-white/50">
                                Organizado por
                              </p>
                              <p className="text-sm font-semibold text-white">
                                {event.organizerName}
                              </p>
                            </div>

                            <div className="text-right">
                              {event.isFree ? (
                                <div className="rounded-lg bg-green-500/10 px-3 py-1.5 border border-green-500/20">
                                  <span className="text-sm font-bold text-green-400">
                                    GRÁTIS
                                  </span>
                                </div>
                              ) : event.price ? (
                                <div>
                                  <p className="text-xs text-white/50">
                                    Participação
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Euro className="h-4 w-4 text-neon-secondary" />
                                    <span className="text-lg font-bold text-white">
                                      {event.price}
                                    </span>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {event.prizeDescription && (
                            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                              <div className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200/90 leading-relaxed">
                                  {event.prizeDescription}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </ProtectedDashboardShell>
    </div>
  );
}
