"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast-custom";
import { addDays, addMonths, addWeeks, format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

type EventType = "jogo" | "treino" | "amistoso" | "reuniao" | "outro";
type RecurrenceType = "none" | "daily" | "weekly" | "monthly";
type ConfirmationMode = "automatic" | "manual";

type FormValues = {
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "confirmado" | "pendente" | "cancelado";
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  confirmationMode: ConfirmationMode;
  advanceNoticeDays: number;
};

const typeMeta: Record<
  EventType,
  {
    label: string;
    emoji: string;
    description: string;
  }
> = {
  jogo: {
    label: "Jogos",
    emoji: "🏆",
    description: "Partidas oficiais e amistosos competitivos",
  },
  treino: {
    label: "Treinos",
    emoji: "🏋️",
    description: "Sessões técnicas e físicas",
  },
  amistoso: {
    label: "Amistosos",
    emoji: "🤝",
    description: "Jogos preparatórios e eventos sociais",
  },
  reuniao: {
    label: "Reuniões",
    emoji: "🗣️",
    description: "Planeamento estratégico e alinhamentos",
  },
  outro: {
    label: "Outros",
    emoji: "📌",
    description: "Eventos gerais e lembretes",
  },
};

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

const getDefaultFormValues = (date?: Date): FormValues => ({
  title: "",
  type: "treino",
  date: toDateInputValue(date ?? new Date()),
  time: "18:00",
  location: "",
  description: "",
  status: "confirmado",
  isRecurring: false,
  recurrenceType: "none",
  confirmationMode: "automatic",
  advanceNoticeDays: 7,
});

const buildDateFromInputs = (date: string, time: string) => {
  if (!date) {
    return null;
  }
  const isoString = `${date}T${time || "12:00"}`;
  return new Date(isoString);
};

export function CreateEventDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>(
    getDefaultFormValues(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const eventDate = buildDateFromInputs(formValues.date, formValues.time);
    if (!eventDate) {
      toast.error("Erro", "Seleciona uma data válida para o evento.");
      setIsSubmitting(false);
      return;
    }

    // Simular criação de eventos (aqui você integraria com a API real)
    const eventsToCreate = [
      {
        id: crypto.randomUUID(),
        ...formValues,
        date: eventDate,
        createdBy: "Equipa Jogabola",
        responses: [],
      },
    ];

    // Se for recorrente, gerar eventos futuros
    if (formValues.isRecurring && formValues.recurrenceType !== "none") {
      const occurrences = 12;
      let currentDate = new Date(eventDate);

      for (let i = 0; i < occurrences; i++) {
        switch (formValues.recurrenceType) {
          case "daily":
            currentDate = addDays(currentDate, 1);
            break;
          case "weekly":
            currentDate = addWeeks(currentDate, 1);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
        }

        eventsToCreate.push({
          id: crypto.randomUUID(),
          ...formValues,
          date: new Date(currentDate),
          status:
            formValues.confirmationMode === "automatic"
              ? "confirmado"
              : "pendente",
          createdBy: "Equipa Jogabola",
          responses: [],
        });
      }

      toast.success(
        "Eventos recorrentes criados",
        `Foram criados ${eventsToCreate.length} eventos (${
          formValues.recurrenceType === "daily"
            ? "diários"
            : formValues.recurrenceType === "weekly"
              ? "semanais"
              : "mensais"
        }).`,
      );
    } else {
      toast.success("Evento criado", "O novo evento foi adicionado à agenda.");
    }

    setIsSubmitting(false);
    setOpen(false);
    setFormValues(getDefaultFormValues());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group min-w-[180px] bg-neon-secondary font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-neon-secondary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a1628]/95 text-white backdrop-blur-xl sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neon-secondary">
            {typeMeta[formValues.type].emoji} Criar novo evento
          </DialogTitle>
          <DialogDescription className="text-base text-white/70">
            Preenche os detalhes para agendar um novo evento na tua agenda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-white">
                Título do evento
              </Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={e =>
                  setFormValues({ ...formValues, title: e.target.value })
                }
                placeholder="Ex: Treino técnico"
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-semibold text-white">
                  Tipo de evento
                </Label>
                <Select
                  value={formValues.type}
                  onValueChange={(value: EventType) =>
                    setFormValues({ ...formValues, type: value })
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                    {Object.entries(typeMeta).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>
                        {meta.emoji} {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-white">
                  Estado
                </Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value: "confirmado" | "pendente" | "cancelado") =>
                    setFormValues({ ...formValues, status: value })
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                    <SelectItem value="confirmado">✅ Confirmado</SelectItem>
                    <SelectItem value="pendente">⏳ Pendente</SelectItem>
                    <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-white">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formValues.date}
                  onChange={e =>
                    setFormValues({ ...formValues, date: e.target.value })
                  }
                  required
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold text-white">
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={e =>
                    setFormValues({ ...formValues, time: e.target.value })
                  }
                  required
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-white">
                Localização
              </Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={e =>
                  setFormValues({ ...formValues, location: e.target.value })
                }
                placeholder="Ex: Centro de Treinos do Clube"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-white">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={e =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
                placeholder="Adiciona detalhes sobre o evento..."
                rows={3}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-white">
                    Evento recorrente
                  </Label>
                  <p className="text-xs text-white/60">
                    Criar múltiplos eventos automaticamente
                  </p>
                </div>
                <Switch
                  checked={formValues.isRecurring}
                  onCheckedChange={checked =>
                    setFormValues({ ...formValues, isRecurring: checked })
                  }
                />
              </div>

              {formValues.isRecurring && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-white">
                      Frequência
                    </Label>
                    <Select
                      value={formValues.recurrenceType}
                      onValueChange={(value: RecurrenceType) =>
                        setFormValues({ ...formValues, recurrenceType: value })
                      }
                    >
                      <SelectTrigger className="border-white/10 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                        <SelectItem value="daily">📅 Diário</SelectItem>
                        <SelectItem value="weekly">📆 Semanal</SelectItem>
                        <SelectItem value="monthly">🗓️ Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-white">
                      Modo de confirmação
                    </Label>
                    <Select
                      value={formValues.confirmationMode}
                      onValueChange={(value: ConfirmationMode) =>
                        setFormValues({ ...formValues, confirmationMode: value })
                      }
                    >
                      <SelectTrigger className="border-white/10 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#0a1628] text-white">
                        <SelectItem value="automatic">
                          ✅ Confirmação automática
                        </SelectItem>
                        <SelectItem value="manual">
                          ⏳ Confirmação manual
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formValues.confirmationMode === "manual" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-white">
                        Dias de antecedência para confirmação
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={formValues.advanceNoticeDays}
                        onChange={e =>
                          setFormValues({
                            ...formValues,
                            advanceNoticeDays: parseInt(e.target.value) || 7,
                          })
                        }
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-neon-secondary font-semibold text-slate-900 shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all hover:bg-neon-secondary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A criar evento...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar evento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
