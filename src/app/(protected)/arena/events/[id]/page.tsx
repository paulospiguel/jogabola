"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Settings,
  Share2,
  Star,
  Target,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { checkEventParticipation } from "@/actions/events";
import { EventImageCarousel } from "@/components/event-image-carousel";
import ShareDialog from "@/components/share-link-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvent } from "@/hooks/use-events";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";
import { useSession } from "@/lib/auth-client";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

// Mapeamento de tipos de eventos para emojis e ícones
const eventTypeEmojis: Record<string, string> = {
  partida: "⚽",
  treino: "🏃",
  grupo: "👥",
  "jogo-treino": "🎯",
  torneio: "🏆",
  competicao: "🥇",
  evento: "🎉",
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    partida: "Partida",
    treino: "Treino",
    grupo: "Grupo",
    "jogo-treino": "Jogo-Treino",
    torneio: "Torneio",
    competicao: "Competição",
    evento: "Evento",
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  if (type === "partida" || type === "torneio" || type === "competicao")
    return Trophy;
  if (type === "treino" || type === "jogo-treino") return Target;
  return Users;
};

export default function ArenaEventDetailsPage() {
  const t = useTranslations("arena");
  const params = useParams();
  const { navigateWithJourneyCheck } = useSafeNavigation();
  const { data: session } = useSession();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const eventId = params.id ? parseInt(params.id as string, 10) : null;
  const { event, isLoading, error } = useEvent(eventId);

  // Verificar se o usuário é organizador ou participante
  const userId = session?.user?.id;
  const isOrganizer = event && userId && event.organizerId === userId;

  // Verificar participação
  const { data: participationData } = useQuery({
    queryKey: ["event-participation", eventId, userId],
    queryFn: async () => {
      if (!eventId || !userId) return { isParticipant: false, status: null };
      const result = await checkEventParticipation(eventId, userId);
      return result.success
        ? result.data
        : { isParticipant: false, status: null };
    },
    enabled: !!eventId && !!userId && !!event,
    staleTime: 1000 * 60 * 5,
  });

  const isParticipant = participationData?.isParticipant || false;
  const userRole = isOrganizer
    ? "organizer"
    : isParticipant
      ? "participant"
      : "viewer";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !event) return;

    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      setShowMessageModal(false);
      setMessage("");
    }, 1000);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleJoinEvent = () => {
    // TODO: Implementar ação de participar do evento
  };

  const handleInvitePeople = () => {
    // TODO: Implementar ação de convidar pessoas
  };

  const handleCreateChat = () => {
    // TODO: Implementar ação de criar chat do evento
  };

  const handleManageParticipants = () => {
    // TODO: Implementar ação de gerenciar participantes
  };

  const handleBlockParticipant = (participantId: string) => {
    // TODO: Implementar ação de bloquear participante
  };

  const handleAddParticipant = () => {
    // TODO: Implementar ação de adicionar participante
  };

  const handleEditEvent = () => {
    // TODO: Implementar ação de editar evento
  };

  const shareLink = event
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/arena/events/${event.id}`
    : "";

  const tDetails = (key: string) => {
    const translationKey = `events.details.${key}` as any;
    return t(translationKey);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-toast-bg dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-200">
            {tDetails("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-toast-bg dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {tDetails("notFound")}
          </p>
          <Button
            onClick={() => navigateWithJourneyCheck("")}
            className="bg-emerald-500 mt-4 text-white hover:bg-emerald-600 dark:bg-neon-secondary dark:text-slate-900"
          >
            {tDetails("back")}
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(event.type);
  const eventEmoji = eventTypeEmojis[event.type] || "📅";

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-emerald-50/60 via-white to-sky-50 text-slate-900 transition-colors dark:from-toast-bg dark:via-[#080a25] dark:to-[#0f163f] dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-200/30 via-white to-sky-200/20 dark:bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(56,189,248,0.15)_0%,rgba(255,255,255,0)_72%)] dark:bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]" />
        <div className="absolute top-32 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-[120px] dark:bg-neon-secondary/12" />
        <div className="absolute right-20 bottom-16 h-80 w-80 rounded-full bg-sky-200/40 blur-[120px] dark:bg-accent-blue/12" />
      </div>

      <main className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
        {/* Header */}
        <motion.header
          className="mb-8 flex items-center gap-4"
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <Button
            variant="ghost"
            onClick={() => navigateWithJourneyCheck("")}
            className="text-slate-700 hover:bg-emerald-50/80 dark:text-white dark:hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            {tDetails("back")}
          </Button>
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex flex-col gap-6"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
            >
              {/* Carrossel de imagens */}
              {event.images && event.images.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.15 }}
                >
                  <EventImageCarousel
                    images={event.images}
                    alt={event.title}
                    className="h-64 rounded-3xl md:h-80 lg:h-96"
                    showControls={event.images.length > 1}
                  />
                </motion.div>
              )}

              {/* Título e tipo */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100/70 bg-emerald-50/80 text-xl shadow dark:border-white/10 dark:bg-white/10">
                    {eventEmoji}
                  </div>
                  <Badge className="border-0 bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] dark:bg-neon-secondary dark:text-slate-900">
                    {getTypeLabel(event.type)}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white">
                  {event.title}
                </h1>
              </div>

              {/* Informações principais */}
              <Card className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-500 dark:text-neon-primary" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-emerald-500 dark:text-neon-primary" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-1 h-5 w-5 shrink-0 text-emerald-500 dark:text-neon-primary" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {event.currentParticipants}
                        {event.maxParticipants &&
                          ` / ${event.maxParticipants}`}{" "}
                        {tDetails("participants")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Descrição */}
              {event.description && (
                <Card className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
                  <CardContent className="p-6">
                    <h2 className="mb-3 text-xl font-semibold text-slate-800 dark:text-white">
                      {tDetails("about")}
                    </h2>
                    <p className="leading-relaxed text-slate-600 dark:text-slate-200/80">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Critérios de participação */}
              {(event.experienceLevel ||
                event.minAge ||
                event.maxAge ||
                event.gender ||
                event.positionNeeded ||
                Object.keys(event.participationCriteria).length > 0) && (
                <Card className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-white">
                      {tDetails("criteria")}
                    </h2>
                    <div className="flex flex-col gap-3">
                      {event.experienceLevel && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-neon-primary" />
                          <span className="text-slate-700 dark:text-slate-200/80">
                            Nível de experiência:{" "}
                            <span className="font-semibold text-slate-900 dark:text-white capitalize">
                              {event.experienceLevel}
                            </span>
                          </span>
                        </div>
                      )}
                      {(event.minAge || event.maxAge) && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-neon-primary" />
                          <span className="text-slate-700 dark:text-slate-200/80">
                            Idade:{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {event.minAge || "?"} - {event.maxAge || "?"} anos
                            </span>
                          </span>
                        </div>
                      )}
                      {event.gender && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-neon-primary" />
                          <span className="text-slate-700 dark:text-slate-200/80">
                            Gênero:{" "}
                            <span className="font-semibold text-slate-900 dark:text-white capitalize">
                              {event.gender}
                            </span>
                          </span>
                        </div>
                      )}
                      {event.positionNeeded && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-neon-primary" />
                          <span className="text-slate-700 dark:text-slate-200/80">
                            Posição necessária:{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {event.positionNeeded}
                            </span>
                          </span>
                        </div>
                      )}
                      {Object.entries(event.participationCriteria).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500 dark:text-neon-primary" />
                            <span className="text-slate-700 dark:text-slate-200/80">
                              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                {key}:
                              </span>{" "}
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Organizador */}
              <Card className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
                <CardContent className="p-6">
                  <h2 className="mb-3 text-xl font-semibold text-slate-800 dark:text-white">
                    {tDetails("organizer")}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-200/80">
                    {event.organizerName}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar com ações */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-8 flex flex-col gap-4"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white shadow-2xl backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/6">
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* View do Organizador */}
                  {userRole === "organizer" && (
                    <>
                      <Button
                        className="bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-neon-secondary dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-neon-secondary/90"
                        size="lg"
                        onClick={handleEditEvent}
                      >
                        <Settings className="mr-2 h-5 w-5" />
                        {t("events.details.actions.organizer.editEvent")}
                      </Button>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleManageParticipants}
                        >
                          <Users className="mr-2 h-5 w-5" />
                          {t(
                            "events.details.actions.organizer.manageParticipants",
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleAddParticipant}
                        >
                          <UserPlus className="mr-2 h-5 w-5" />
                          {t("events.details.actions.organizer.addParticipant")}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleCreateChat}
                        >
                          <MessageSquare className="mr-2 h-5 w-5" />
                          {t("events.details.actions.organizer.createChat")}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* View do Participante */}
                  {userRole === "participant" && (
                    <>
                      <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-50/50 p-3 text-center dark:border-neon-secondary/50 dark:bg-neon-secondary/10">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-neon-secondary">
                          ✓ {t("events.details.participating")}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleInvitePeople}
                        >
                          <UserPlus className="mr-2 h-5 w-5" />
                          {t("events.details.actions.participant.invitePeople")}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleCreateChat}
                        >
                          <MessageSquare className="mr-2 h-5 w-5" />
                          {t("events.details.actions.participant.createChat")}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleManageParticipants}
                        >
                          <Users className="mr-2 h-5 w-5" />
                          {t(
                            "events.details.actions.participant.manageParticipants",
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* View do Visualizador */}
                  {userRole === "viewer" && (
                    <>
                      <Button
                        className="bg-emerald-500 font-semibold text-white shadow-[0_16px_45px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-neon-secondary dark:text-slate-900 dark:shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] dark:hover:bg-neon-secondary/90"
                        size="lg"
                        onClick={handleJoinEvent}
                      >
                        {tDetails("join")}
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className={`border-2 transition-all ${
                            isFavorited
                              ? "border-emerald-500 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/80 dark:border-neon-secondary dark:bg-neon-secondary/10 dark:text-neon-secondary hover:dark:bg-neon-secondary/20"
                              : "border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          }`}
                          onClick={handleToggleFavorite}
                        >
                          <Star
                            className={`mr-2 h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                          />
                          {isFavorited
                            ? tDetails("favorited")
                            : tDetails("favorite")}
                        </Button>

                        <Button
                          variant="outline"
                          className={`border-2 transition-all ${
                            isFollowing
                              ? "border-emerald-500 bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/80 dark:border-neon-secondary dark:bg-neon-secondary/10 dark:text-neon-secondary hover:dark:bg-neon-secondary/20"
                              : "border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          }`}
                          onClick={handleToggleFollow}
                        >
                          <Bell
                            className={`mr-2 h-5 w-5 ${isFollowing ? "fill-current" : ""}`}
                          />
                          {isFollowing
                            ? tDetails("following")
                            : tDetails("follow")}
                        </Button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={handleShare}
                        >
                          <Share2 className="mr-2 h-5 w-5" />
                          {tDetails("share")}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-emerald-100/70 bg-white text-slate-700 hover:bg-emerald-50/80 dark:border-white/25 dark:bg-white/10 dark:text-white hover:dark:bg-white/20"
                          onClick={() => setShowMessageModal(true)}
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          {tDetails("sendMessage")}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <ShareDialog
        isOpen={showShareDialog}
        onOpenChange={setShowShareDialog}
        link={shareLink}
      />

      {/* Modal de mensagem */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("events.details.messageModal.title")}</DialogTitle>
            <DialogDescription>
              {t("events.details.messageModal.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">
                {t("events.details.messageModal.label")}
              </Label>
              <Textarea
                id="message"
                placeholder={t("events.details.messageModal.placeholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage("");
                }}
              >
                {t("events.details.messageModal.cancel")}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendingMessage}
                className="bg-emerald-500 font-semibold text-white hover:bg-emerald-600 dark:bg-neon-secondary dark:text-slate-900"
              >
                {sendingMessage
                  ? t("events.details.messageModal.sending")
                  : t("events.details.messageModal.send")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
