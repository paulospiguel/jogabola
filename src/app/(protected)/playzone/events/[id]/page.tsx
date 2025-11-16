"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShareDialog from "@/components/share-link-dialog";
import { EventImageCarousel } from "@/components/event-image-carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Trophy,
  Target,
  Share2,
  MessageCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface EventDetails {
  id: number;
  title: string;
  description: string;
  type: "partida" | "treino" | "grupo";
  location: string;
  city?: string;
  country?: string;
  startDate: string;
  endDate?: string;
  gameStyle?: string;
  experienceLevel?: string;
  minAge?: string;
  maxAge?: string;
  gender?: string;
  positionNeeded?: string;
  participationCriteria: Record<string, any>;
  currentParticipants: number;
  maxParticipants?: number;
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  language?: string;
  images?: string[];
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Mock data - substituir por chamada à API
  useEffect(() => {
    const eventId = params.id;
    setTimeout(() => {
      setEvent({
        id: Number(eventId),
        title: "Pelada Dominical - Parque Central",
        description:
          "Partida recreativa de futebol 11 para todos os níveis. Venha se divertir e fazer novos amigos!",
        type: "partida",
        location: "Parque Central",
        city: "Lisboa",
        country: "Portugal",
        startDate: "2024-11-17T10:00:00",
        endDate: "2024-11-17T12:00:00",
        gameStyle: "recreativo",
        experienceLevel: "intermediate",
        minAge: "18",
        maxAge: "50",
        gender: "misto",
        participationCriteria: {
          experience: "intermediate ou superior",
          equipment: "Trazer chuteiras e caneleiras",
          commitment: "Confirmar presença até 24h antes",
        },
        currentParticipants: 12,
        maxParticipants: 22,
        organizerId: "1",
        organizerName: "João Silva",
        organizerEmail: "joao@example.com",
        language: "pt",
        images: [
          "/images/login-stadium.jpg",
          "/temp/barreiro.jpg",
          "/temp/bolacacem.jpg",
        ],
      });
      setLoading(false);
    }, 500);
  }, [params.id]);

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
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !event) return;

    setSendingMessage(true);
    // TODO: Implementar envio de mensagem
    setTimeout(() => {
      setSendingMessage(false);
      setShowMessageModal(false);
      setMessage("");
      // Mostrar toast de sucesso
    }, 1000);
  };

  const shareLink = event
    ? `${window.location.origin}/playzone/events/${event.id}`
    : "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050312] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#6fffe9] border-t-transparent" />
          <p className="text-text-secondary">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050312] text-white">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Evento não encontrado</p>
          <Button
            onClick={() => router.back()}
            className="mt-4 bg-neon-secondary text-slate-900"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(event.type);

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
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            <motion.div
              className="space-y-6"
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
                    className="h-64 md:h-80 lg:h-96 rounded-3xl"
                    showControls={event.images.length > 1}
                  />
                </motion.div>
              )}

              {/* Título e tipo */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TypeIcon className="h-6 w-6 text-[#24ffe6]" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-[#24ffe6]">
                    {getTypeLabel(event.type)}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white">{event.title}</h1>
              </div>

              {/* Informações principais */}
              <Card className="rounded-3xl border border-white/10 bg-white/6 p-6">
                <CardContent className="space-y-4 p-0">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-[#24ffe6]" />
                    <div>
                      <p className="font-medium text-white">{event.location}</p>
                      {(event.city || event.country) && (
                        <p className="text-sm text-white/60">
                          {[event.city, event.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-1 h-5 w-5 flex-shrink-0 text-[#24ffe6]" />
                    <div>
                      <p className="font-medium text-white">
                        {formatDate(event.startDate)}
                      </p>
                      {event.endDate && (
                        <p className="text-sm text-white/60">
                          Até {formatDate(event.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-1 h-5 w-5 flex-shrink-0 text-[#24ffe6]" />
                    <div>
                      <p className="font-medium text-white">
                        {event.currentParticipants}
                        {event.maxParticipants && ` / ${event.maxParticipants}`}{" "}
                        participantes
                      </p>
                    </div>
                  </div>

                  {event.gameStyle && (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-[#24ffe6]" />
                      <div>
                        <p className="font-medium text-white capitalize">
                          Estilo: {event.gameStyle}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Descrição */}
              {event.description && (
                <Card className="rounded-3xl border border-white/10 bg-white/6 p-6">
                  <CardContent className="p-0">
                    <h2 className="mb-3 text-xl font-semibold text-white">
                      Sobre o evento
                    </h2>
                    <p className="text-white/80 leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Critérios de participação */}
              <Card className="rounded-3xl border border-white/10 bg-white/6 p-6">
                <CardContent className="p-0">
                  <h2 className="mb-4 text-xl font-semibold text-white">
                    Critérios para participar
                  </h2>
                  <div className="space-y-3">
                    {event.experienceLevel && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-white/80">
                          Nível de experiência:{" "}
                          <span className="font-medium capitalize text-white">
                            {event.experienceLevel}
                          </span>
                        </span>
                      </div>
                    )}
                    {(event.minAge || event.maxAge) && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-white/80">
                          Idade:{" "}
                          <span className="font-medium text-white">
                            {event.minAge || "?"} - {event.maxAge || "?"} anos
                          </span>
                        </span>
                      </div>
                    )}
                    {event.gender && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-white/80">
                          Gênero:{" "}
                          <span className="font-medium capitalize text-white">
                            {event.gender}
                          </span>
                        </span>
                      </div>
                    )}
                    {event.positionNeeded && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-white/80">
                          Posição necessária:{" "}
                          <span className="font-medium text-white">
                            {event.positionNeeded}
                          </span>
                        </span>
                      </div>
                    )}
                    {Object.entries(event.participationCriteria).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                          <span className="text-white/80">
                            <span className="font-medium capitalize text-white">
                              {key}:
                            </span>{" "}
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Organizador */}
              <Card className="rounded-3xl border border-white/10 bg-white/6 p-6">
                <CardContent className="p-0">
                  <h2 className="mb-3 text-xl font-semibold text-white">
                    Organizador
                  </h2>
                  <p className="text-white/80">{event.organizerName}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar com ações */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-8 space-y-4"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border border-[#24ffe6]/25 bg-gradient-to-br from-[#042d39] to-[#081b2d] p-6">
                <CardContent className="space-y-4 p-0">
                  <Button
                    className="w-full bg-neon-secondary font-semibold text-slate-900"
                    size="lg"
                  >
                    Participar do evento
                  </Button>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-white/25 bg-white/10 text-white hover:bg-white/20"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Compartilhar
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-2 border-white/25 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => setShowMessageModal(true)}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Enviar mensagem
                    </Button>
                  </div>
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
            <DialogTitle>Enviar mensagem ao organizador</DialogTitle>
            <DialogDescription>
              Envie uma mensagem para {event.organizerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Escreva sua mensagem aqui..."
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
                Cancelar
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendingMessage}
                className="bg-neon-secondary text-slate-900"
              >
                {sendingMessage ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

