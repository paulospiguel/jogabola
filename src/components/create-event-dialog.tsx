"use client";

import { createEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  type: z.enum(["partida", "treino", "grupo", "jogo-treino"]),
  location: z.string().min(3, "Localização é obrigatória"),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
  maxParticipants: z.string().optional(),
});

export function CreateEventDialog() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "partida",
      location: "",
      maxParticipants: "",
      time: "19:00",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um evento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Combine date and time
    const [hours, minutes] = values.time.split(":").map(Number);
    const startDate = new Date(values.date);
    startDate.setHours(hours, minutes);

    const result = await createEvent({
      title: values.title,
      type: values.type,
      location: values.location,
      startDate: startDate,
      maxParticipants: values.maxParticipants,
      organizerId: session.user.id,
      isPublic: true,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      toast({
        title: "Evento criado!",
        description: "Redirecionando para a página do evento...",
      });
      setOpen(false);
      form.reset();
      // Redirect to event page
      window.location.href = `/playzone/events/${result.data.id}`;
    } else {
      toast({
        title: "Erro ao criar evento",
        description:
          "Ocorreu um erro ao tentar criar o evento. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neon-primary hover:bg-neon-primary/90 font-semibold text-slate-900 shadow-[0_0_20px_-5px_rgba(36,255,230,0.5)]">
          <Plus className="mr-2 h-4 w-4" />
          Criar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#081326] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os detalhes do evento para convidar jogadores.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Treino Tático"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-white/10 bg-white/5 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/10 bg-[#081326] text-white">
                        <SelectItem value="partida">Partida</SelectItem>
                        <SelectItem value="treino">Treino</SelectItem>
                        <SelectItem value="jogo-treino">Jogo-Treino</SelectItem>
                        <SelectItem value="grupo">Grupo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. Jogadores</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 22"
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Arena Centenário"
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full border-white/10 bg-white/5 pl-3 text-left font-normal text-white hover:bg-white/10 hover:text-white",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border-white/10 bg-[#081326] p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="bg-[#081326] text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-neon-primary hover:bg-neon-primary/90 w-full font-semibold text-slate-900"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Evento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
