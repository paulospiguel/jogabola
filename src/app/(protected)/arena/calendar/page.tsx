"use client";

import {
  EventCalendar,
  type CalendarEvent,
  type EventType,
} from "@/components/event-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast-custom";
import { format, isAfter, isSameDay as isSameDayFn } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";

type ResponseStatus = "aceito" | "pendente" | "recusado";

type EventResponse = {
  name: string;
  status: ResponseStatus;
  respondedAt?: Date;
};

type AgendaEvent = CalendarEvent & {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  time: string;
  location?: string;
  status: "confirmado" | "pendente" | "cancelado";
  createdBy: string;
  responses: EventResponse[];
};

type FormValues = {
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "confirmado" | "pendente" | "cancelado";
};

type AcceptanceSummary = {
  accepted: number;
  pending: number;
  declined: number;
  lastAcceptedAt?: Date;
  nextEventDate?: Date;
};

const typeMeta: Record<
  EventType,
  {
    label: string;
    emoji: string;
    highlight: string;
    badgeBg: string;
    description: string;
  }
> = {
  jogo: {
    label: "Jogos",
    emoji: "🏆",
    highlight: "text-red-500",
    badgeBg: "bg-red-100",
    description: "Partidas oficiais e amistosos competitivos",
  },
  treino: {
    label: "Treinos",
    emoji: "🏋️",
    highlight: "text-emerald-500",
    badgeBg: "bg-emerald-100",
    description: "Sessões técnicas e físicas",
  },
  amistoso: {
    label: "Amistosos",
    emoji: "🤝",
    highlight: "text-purple-500",
    badgeBg: "bg-purple-100",
    description: "Jogos preparatórios e eventos sociais",
  },
  reuniao: {
    label: "Reuniões",
    emoji: "🗣️",
    highlight: "text-amber-500",
    badgeBg: "bg-amber-100",
    description: "Planeamento estratégico e alinhamentos",
  },
  outro: {
    label: "Outros",
    emoji: "📌",
    highlight: "text-slate-500",
    badgeBg: "bg-slate-100",
    description: "Eventos gerais e lembretes",
  },
};

const statusStyles: Record<
  AgendaEvent["status"],
  { label: string; className: string }
> = {
  confirmado: {
    label: "Confirmado",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

const isSameDay = (a: Date, b: Date) => isSameDayFn(a, b);

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");
const toTimeInputValue = (date: Date) => format(date, "HH:mm");

const buildDateFromInputs = (date: string, time: string) => {
  if (!date) {
    return null;
  }
  const isoString = `${date}T${time || "12:00"}`;
  return new Date(isoString);
};

const formatDateLabel = (date: Date) =>
  format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });

const formatDateTimeLabel = (date?: Date) =>
  date ? format(date, "dd/MM 'às' HH:mm", { locale: ptBR }) : "Sem registos";

const formatTimeLabel = (date: Date) => format(date, "HH:mm", { locale: ptBR });

const getDefaultFormValues = (date: Date): FormValues => ({
  title: "",
  type: "treino",
  date: toDateInputValue(date),
  time: "18:00",
  location: "",
  description: "",
  status: "confirmado",
});

const sortEvents = (events: AgendaEvent[]) =>
  [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

const initialEvents: AgendaEvent[] = sortEvents([
  {
    id: "evt-1",
    title: "Treino técnico",
    type: "treino",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      19,
      30,
    ),
    time: "19:30",
    location: "Centro de Treinos do Clube",
    description: "Sessão focada em posse de bola e pressão alta.",
    status: "confirmado",
    createdBy: "Comissão Técnica",
    responses: [
      {
        name: "Ana Silva",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        name: "João Pereira",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
      },
      { name: "Carlos Lima", status: "pendente" },
      {
        name: "Mariana Souza",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
    ],
  },
  {
    id: "evt-2",
    title: "Jogo - Liga Regional",
    type: "jogo",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 3,
      16,
      0,
    ),
    time: "16:00",
    location: "Estádio Municipal",
    description: "Partida válida pela 8ª rodada da Liga Regional.",
    status: "confirmado",
    createdBy: "Depart. Competições",
    responses: [
      {
        name: "Ana Silva",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      { name: "João Pereira", status: "pendente" },
      {
        name: "Carlos Lima",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        name: "Mariana Souza",
        status: "recusado",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    ],
  },
  {
    id: "evt-3",
    title: "Reunião de alinhamento",
    type: "reuniao",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1,
      11,
      30,
    ),
    time: "11:30",
    location: "Sede administrativa",
    description: "Revisão de metas do trimestre e definição de prioridades.",
    status: "pendente",
    createdBy: "Direção",
    responses: [
      { name: "Presidente", status: "aceito", respondedAt: new Date() },
      { name: "Coordenador Técnico", status: "pendente" },
      { name: "Diretor Financeiro", status: "pendente" },
    ],
  },
  {
    id: "evt-4",
    title: "Amistoso beneficente",
    type: "amistoso",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 7,
      20,
      0,
    ),
    time: "20:00",
    location: "Arena Solidária",
    description: "Evento beneficente com arrecadação de alimentos.",
    status: "confirmado",
    createdBy: "Marketing",
    responses: [
      {
        name: "Equipa Principal",
        status: "aceito",
        respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      },
      { name: "Convidados VIP", status: "pendente" },
    ],
  },
]);

export default function AgendaPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(
    getDefaultFormValues(new Date()),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingGCal, setIsSyncingGCal] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      icon: typeMeta[event.type].emoji,
      iconBg: typeMeta[event.type].badgeBg,
      value: event.responses.filter(response => response.status === "aceito")
        .length,
    }));
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    return events
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, selectedDate]);

  const acceptanceSummary = useMemo(() => {
    const base: Record<EventType, AcceptanceSummary> = {
      jogo: { accepted: 0, pending: 0, declined: 0 },
      treino: { accepted: 0, pending: 0, declined: 0 },
      amistoso: { accepted: 0, pending: 0, declined: 0 },
      reuniao: { accepted: 0, pending: 0, declined: 0 },
      outro: { accepted: 0, pending: 0, declined: 0 },
    };

    const now = new Date();

    events.forEach(event => {
      const summary = base[event.type];
      if (!summary) return;

      let lastAcceptedAt = summary.lastAcceptedAt;

      event.responses.forEach(response => {
        if (response.status === "aceito") {
          summary.accepted += 1;
          if (response.respondedAt) {
            if (
              !lastAcceptedAt ||
              isAfter(response.respondedAt, lastAcceptedAt)
            ) {
              lastAcceptedAt = response.respondedAt;
            }
          }
        } else if (response.status === "pendente") {
          summary.pending += 1;
        } else {
          summary.declined += 1;
        }
      });

      summary.lastAcceptedAt = lastAcceptedAt ?? summary.lastAcceptedAt;

      if (
        isAfter(event.date, now) &&
        (!summary.nextEventDate || isAfter(summary.nextEventDate, event.date))
      ) {
        summary.nextEventDate = event.date;
      }
    });

    return base;
  }, [events]);

  const handleSelectDate = (date?: Date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleCalendarEventClick = (event: CalendarEvent) => {
    const agendaEvent = events.find(
      item => item.id === (event as AgendaEvent).id,
    );
    if (!agendaEvent) return;
    setSelectedEvent(agendaEvent);
    setIsDetailsOpen(true);
  };

  const openForm = (
    mode: "create" | "edit",
    date?: Date,
    eventToEdit?: AgendaEvent,
  ) => {
    setFormMode(mode);
    if (mode === "create") {
      const referenceDate = date ?? selectedDate ?? new Date();
      setFormValues(getDefaultFormValues(referenceDate));
      setEditingEvent(null);
    } else if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setFormValues({
        title: eventToEdit.title,
        type: eventToEdit.type,
        date: toDateInputValue(eventToEdit.date),
        time: eventToEdit.time,
        location: eventToEdit.location || "",
        description: eventToEdit.description || "",
        status: eventToEdit.status,
      });
    }
    setIsFormOpen(true);
  };

  const handleCreateClick = (date?: Date) => {
    openForm("create", date);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    openForm("edit", event.date, event);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
      setIsDetailsOpen(false);
    }
    toast.success("Evento removido", "A agenda foi atualizada.");
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const eventDate = buildDateFromInputs(formValues.date, formValues.time);
    if (!eventDate) {
      toast.error("Erro", "Seleciona uma data válida para o evento.");
      setIsSubmitting(false);
      return;
    }

    const baseEvent: Omit<AgendaEvent, "id"> = {
      type: formValues.type,
      date: eventDate,
      title: formValues.title,
      time: formValues.time,
      location: formValues.location || undefined,
      description: formValues.description || undefined,
      status: formValues.status,
      createdBy: "Equipa Jogabola",
      responses: editingEvent?.responses ?? [],
      icon: typeMeta[formValues.type].emoji,
      iconBg: typeMeta[formValues.type].badgeBg,
    };

    if (formMode === "create") {
      const newEvent: AgendaEvent = {
        ...baseEvent,
        id: crypto.randomUUID(),
        responses: [],
      };
      setEvents(prev => sortEvents([...prev, newEvent]));
      setSelectedDate(eventDate);
      toast.success("Evento criado", "O novo evento foi adicionado à agenda.");
    } else if (editingEvent) {
      const updated: AgendaEvent = {
        ...editingEvent,
        ...baseEvent,
      };
      setEvents(prev =>
        sortEvents(
          prev.map(event => (event.id === updated.id ? updated : event)),
        ),
      );
      setSelectedEvent(updated);
      toast.success("Evento atualizado", "As alterações foram guardadas.");
    }

    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  const handleSyncGoogleCalendar = () => {
    if (isSyncingGCal) return;
    setIsSyncingGCal(true);
    setTimeout(() => {
      setIsSyncingGCal(false);
      const syncDate = new Date();
      setLastSyncAt(syncDate);
      toast.success(
        "Sincronização concluída",
        "Eventos sincronizados com o Google Calendar.",
      );
    }, 1500);
  };

  const renderResponseBadge = (status: ResponseStatus) => {
    if (status === "aceito") {
      return (
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
          Aceite
        </Badge>
      );
    }
    if (status === "pendente") {
      return (
        <Badge className="border-amber-200 bg-amber-100 text-amber-700">
          Pendente
        </Badge>
      );
    }
    return (
      <Badge className="border-red-200 bg-red-100 text-red-700">Recusado</Badge>
    );
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
            <CalendarClock className="h-4 w-4" />
            Agenda inteligente
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Agenda da equipa
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Organiza treinos, jogos e reuniões num só lugar. Acompanha
            confirmações de presença, gere alterações e integra tudo com o
            Google Calendar para manter a equipa alinhada.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncingGCal}
            className="border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-transparent dark:text-emerald-300"
          >
            {isSyncingGCal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isSyncingGCal
              ? "A sincronizar..."
              : "Sincronizar com Google Calendar"}
          </Button>
          <Button
            onClick={() => handleCreateClick(selectedDate)}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo evento
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="rounded-3xl border-emerald-100/60 bg-white/90 shadow-[0_32px_60px_-45px_rgba(16,185,129,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#0f163f]/60 dark:text-white dark:shadow-[0_32px_60px_-45px_rgba(36,255,230,0.35)]">
          <CardHeader className="border-b border-emerald-100/60 pb-4 dark:border-white/10">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              Calendário da temporada
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
              Seleciona um dia para ver os eventos agendados ou clicando em um
              marcador para detalhes rápidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EventCalendar
              events={calendarEvents}
              selected={selectedDate}
              onSelect={handleSelectDate}
              onEventClick={handleCalendarEventClick}
              showTotal={false}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-full rounded-3xl border-emerald-100/60 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
            <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100/60 pb-4 dark:border-white/10">
              <div>
                <CardTitle className="text-base font-semibold">
                  {formatDateLabel(selectedDate)}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-300">
                  {selectedDateEvents.length} evento(s) agendados
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCreateClick(selectedDate)}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300"
              >
                <Plus className="mr-2 h-4 w-4" /> novo evento
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-500/40 dark:bg-white/5">
                  <CalendarDays className="h-8 w-8 text-emerald-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-white">
                      Nenhum compromisso aqui ainda
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      Cria eventos para treinos, jogos ou reuniões diretamente
                      nesta data.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateClick(selectedDate)}
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    Agendar agora
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => {
                    const accepted = event.responses.filter(
                      response => response.status === "aceito",
                    ).length;
                    const pending = event.responses.filter(
                      response => response.status === "pendente",
                    ).length;
                    const declined = event.responses.filter(
                      response => response.status === "recusado",
                    ).length;

                    return (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-emerald-100/60 bg-white/80 p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {typeMeta[event.type].emoji}
                              </span>
                              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                                {event.title}
                              </h3>
                              <Badge
                                className={
                                  statusStyles[event.status].className +
                                  " font-medium"
                                }
                              >
                                {statusStyles[event.status].label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
                              <span className="flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {event.time}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users2 className="h-3.5 w-3.5" />
                                {accepted} aceites · {pending} pendentes ·{" "}
                                {declined} recusos
                              </span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                              >
                                <span className="sr-only">Abrir ações</span>
                                <span className="text-lg">⋮</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditEvent(event)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {event.description && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-emerald-100/60 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-800 dark:text-white">
                Estado da sincronização
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-300">
                Conecta a agenda do Jogabola com o Google Calendar para garantir
                que toda a equipa esteja atualizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-emerald-100/60 bg-emerald-50/60 px-4 py-3 text-xs text-slate-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                <span>
                  {lastSyncAt
                    ? `Última sincronização em ${formatDateTimeLabel(lastSyncAt)}`
                    : "Sem sincronizações anteriores"}
                </span>
                <Badge className="border-emerald-300 bg-white text-emerald-600 dark:border-emerald-500/50 dark:bg-transparent dark:text-emerald-300">
                  Google Calendar
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Ao sincronizar vinculamos automaticamente treinos, jogos,
                eventos e reuniões ao calendário pessoal de cada atleta ou
                membro da equipa.
              </p>
              <Button
                size="sm"
                onClick={handleSyncGoogleCalendar}
                disabled={isSyncingGCal}
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {isSyncingGCal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isSyncingGCal ? "A sincronizar..." : "Sincronizar agora"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Datas de aceite por categoria
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Monitoriza confirmações para antecipar necessidades de convocatória.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(typeMeta) as EventType[]).map(type => {
            const meta = typeMeta[type];
            const summary = acceptanceSummary[type];
            const totalResponses =
              summary.accepted + summary.pending + summary.declined;
            const acceptanceRate = totalResponses
              ? Math.round((summary.accepted / totalResponses) * 100)
              : 0;

            return (
              <Card
                key={type}
                className="rounded-3xl border-emerald-100/60 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${meta.highlight}`}>
                      {meta.emoji}
                    </span>
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                        {meta.label}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-300">
                        {meta.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-1 text-slate-500 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        {summary.accepted} aceites
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                        {summary.pending} pendentes
                      </div>
                      <div className="flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        {summary.declined} recusos
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-right text-xs font-semibold text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                      {acceptanceRate}%
                      <div className="text-[10px] font-normal text-emerald-500/80 dark:text-emerald-200/80">
                        taxa de aceite
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-500 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-white/5">
                    <span>Último aceite</span>
                    <span className="font-medium text-slate-700 dark:text-white">
                      {summary.lastAcceptedAt
                        ? formatDateTimeLabel(summary.lastAcceptedAt)
                        : "Sem respostas"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-white/5">
                    <span>Próximo compromisso</span>
                    <span className="font-medium text-slate-700 dark:text-white">
                      {summary.nextEventDate
                        ? formatDateTimeLabel(summary.nextEventDate)
                        : "Sem agenda"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Novo evento" : "Editar evento"}
            </DialogTitle>
            <DialogDescription>
              Preenche os detalhes para convidar a equipa e controlar as
              confirmações.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do evento</Label>
                <Input
                  id="title"
                  value={formValues.title}
                  onChange={event =>
                    setFormValues(prev => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ex: Treino tático"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formValues.type}
                  onValueChange={value =>
                    setFormValues(prev => ({
                      ...prev,
                      type: value as EventType,
                    }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleciona o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(typeMeta) as EventType[]).map(type => (
                      <SelectItem key={type} value={type}>
                        {typeMeta[type].emoji} {typeMeta[type].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formValues.date}
                  onChange={event =>
                    setFormValues(prev => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={event =>
                    setFormValues(prev => ({
                      ...prev,
                      time: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formValues.location}
                  onChange={event =>
                    setFormValues(prev => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Ex: Campo sintético - Campo Grande"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formValues.status}
                  onValueChange={value =>
                    setFormValues(prev => ({
                      ...prev,
                      status: value as AgendaEvent["status"],
                    }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notas e objetivos</Label>
              <Textarea
                id="description"
                rows={4}
                value={formValues.description}
                onChange={event =>
                  setFormValues(prev => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Adiciona contexto, objetivos ou logística para a equipa."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : formMode === "create" ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <Pencil className="mr-2 h-4 w-4" />
                )}
                {formMode === "create"
                  ? "Guardar evento"
                  : "Guardar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailsOpen && !!selectedEvent}
        onOpenChange={setIsDetailsOpen}
      >
        <DialogContent className="max-w-xl">
          {selectedEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                  <span
                    className={`text-xl ${typeMeta[selectedEvent.type].highlight}`}
                  >
                    {typeMeta[selectedEvent.type].emoji}
                  </span>
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedEvent.description || "Sem descrição detalhada."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 rounded-2xl border border-emerald-100/60 bg-emerald-50/60 p-4 text-xs text-slate-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {formatDateTimeLabel(selectedEvent.date)}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  Criado por {selectedEvent.createdBy}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  Respostas da equipa
                </h3>
                {selectedEvent.responses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-emerald-200 p-4 text-xs text-slate-500 dark:border-emerald-500/40 dark:text-slate-300">
                    Ainda não há respostas registradas. Envia convites ou
                    partilha o evento para recolher confirmações.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {selectedEvent.responses.map(response => (
                      <div
                        key={`${selectedEvent.id}-${response.name}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 dark:text-white">
                            {response.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-300">
                            {response.respondedAt
                              ? `Atualizado ${formatDateTimeLabel(response.respondedAt)}`
                              : "Sem resposta"}
                          </span>
                        </div>
                        {renderResponseBadge(response.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!selectedEvent) return;
                    setIsDetailsOpen(false);
                    handleEditEvent(selectedEvent);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Editar evento
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    selectedEvent && handleDeleteEvent(selectedEvent.id)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remover evento
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
