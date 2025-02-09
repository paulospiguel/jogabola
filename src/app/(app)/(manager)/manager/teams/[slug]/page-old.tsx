"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  Activity,
  BarChart2,
  Newspaper,
  ChevronRight,
  ChevronLeft,
  Plus,
  Edit,
  Send,
  Award,
  Share2,
  Trash2,
  Save,
  Repeat2,
  Copy,
  Info,
  Edit2,
  Camera,
} 
import { FormField } from "@/components/ui/form";
import { cn } from "@/utils";

import noImage from "@/assets/images/JOGABOLA-shield.svg";

const hasEditPermission = true; // In a real app, this would be determined by the user's role

const initialTeamData = {
  name: "Estrelas do Futebol FC",
  foundedYear: 1950,
  homeStadium: "Estádio Municipal",
  league: "Liga Principal",
  bio: "Um clube com tradição e paixão pelo futebol, formando estrelas desde 1950.",
};

const initialStaff = [
  {
    id: 1,
    name: "João Silva",
    role: "coach",
    email: "WQGxH@example.com",
    invited: false,
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "physiotherapist",
    email: "V5vCf@example.com",
    invited: true,
  },
];

const initialPlayers = [
  {
    id: 1,
    name: "Carlos Silva",
    position: "Atacante",
    number: 10,
    nationality: "🇧🇷",
    invited: false,
  },
  {
    id: 2,
    name: "João Oliveira",
    position: "Meio-campo",
    number: 8,
    nationality: "🇵🇹",
    invited: false,
  },
  {
    id: 3,
    name: "Pedro Santos",
    position: "Defensor",
    number: 4,
    nationality: "🇧🇷",
    invited: true,
  },
  {
    id: 4,
    name: "André Gomes",
    position: "Goleiro",
    number: 1,
    nationality: "🇦🇷",
    invited: false,
  },
];

const initialEvents = [
  {
    id: 1,
    type: "Jogo",
    title: "Estrelas do Futebol FC vs Rivais Unidos",
    date: "2024-06-15",
    time: "20:00",
    location: "Estádio Municipal",
  },
  {
    id: 2,
    type: "Treino",
    title: "Treino Tático",
    date: "2024-06-10",
    time: "09:00",
    location: "Centro de Treinamento",
  },
];

const roles = [
  "president",
  "vice-president",
  "director",
  "secretary",
  "performance-analyst",
  "manager",
  "coach",
  "admin",
  "owner",
  "guest",
  "assistant",
  "assistent-coach",
  "assistant-manager",
  "manager-coach",
  "assistant-manager-coach",
  "techinal-analyst",
  "watcher",
  "observer",
  "financial-analyst",
  "trainer",
  "physical-trainer",
  "goalkeeper-trainer",
];

const initialCompetitions = [
  { id: 1, name: "Liga Principal", position: 3, points: 45 },
  { id: 2, name: "Copa Nacional", stage: "Quartas de Final" },
];

const initialBanners = [
  { id: 1, image: "/banner1.jpg", title: "Novo Patrocinador" },
  { id: 2, image: "/banner2.jpg", title: "Promoção de Ingressos" },
];

const addStaffSchema = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().email(),
});

export default function EquipeFutebol() {
  const [teamData, setTeamData] = useState(initialTeamData);
  const [staff, setStaff] = useState(initialStaff);
  const [players, setPlayers] = useState(initialPlayers);
  const [events, setEvents] = useState(initialEvents);
  const [competitions, setCompetitions] = useState(initialCompetitions);
  const [banners, setBanners] = useState(initialBanners);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isConvocationModalOpen, setIsConvocationModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isShowAddStaff, setIsShowAddStaff] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState<number[]>([]);
  const [openShareModal, setOpenShareModal] = useState<string | number | null>(
    null,
  );

  const t = useTranslations();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof addStaffSchema>>({
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  const addStaffMember = (name: string, role: string, email: string) => {
    setStaff([...staff, { id: Date.now(), name, role, email, invited: true }]);
  };

  const addPlayer = (
    name: string,
    position: string,
    number: number,
    nationality: string,
  ) => {
    setPlayers([
      ...players,
      { id: Date.now(), name, position, number, nationality, invited: true },
    ]);
  };

  const addEvent = (
    type: string,
    title: string,
    date: string,
    time: string,
    location: string,
  ) => {
    setEvents([
      ...events,
      { id: Date.now(), type, title, date, time, location },
    ]);
  };

  const addCompetition = (name: string, position: number, points: number) => {
    setCompetitions([
      ...competitions,
      { id: Date.now(), name, position, points },
    ]);
  };

  const addBanner = (image: string, title: string) => {
    setBanners([...banners, { id: Date.now(), image, title }]);
  };

  const toggleInvite = (id: number, type: "staff" | "player") => {
    if (type === "staff") {
      setStaff(
        staff.map(member =>
          member.id === id ? { ...member, invited: !member.invited } : member,
        ),
      );
    } else {
      setPlayers(
        players.map(player =>
          player.id === id ? { ...player, invited: !player.invited } : player,
        ),
      );
    }
  };

  const nextEvent = () => {
    setCurrentEventIndex(prevIndex => (prevIndex + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex(
      prevIndex => (prevIndex - 1 + events.length) % events.length,
    );
  };

  const openConvocationModal = () => {
    setIsConvocationModalOpen(true);
  };

  const closeConvocationModal = () => {
    setIsConvocationModalOpen(false);
    setSelectedGame(null);
    setSelectedPlayers([]);
  };

  const handleGameSelection = gameId => {
    setSelectedGame(events.find(event => event.id === gameId));
  };

  const handlePlayerSelection = playerId => {
    setSelectedPlayers(prevSelected =>
      prevSelected.includes(playerId)
        ? prevSelected.filter(id => id !== playerId)
        : [...prevSelected, playerId],
    );
  };

  const saveConvocation = () => {
    console.log("Convocation saved:", {
      game: selectedGame,
      players: selectedPlayers,
    });
    closeConvocationModal();
  };

  const exportConvocation = format => {
    console.log(`Exporting convocation as ${format}`);
  };

  const shareConvocation = platform => {
    console.log(`Sharing convocation on ${platform}`);
  };

  const handleAddStaff = (formData: z.infer<typeof addStaffSchema>) => {
    addStaffMember(formData.name, formData.role, formData.email);
    reset();
    setIsShowAddStaff(false);
  };

  const removeMember = (id: number) => {
    setStaff(staff.filter(member => member.id !== id));
  };

  const sendInvitation = (id: number, action?: "send" | "retry") => {
    toast({
      title: "Invitation sent",
      description: "Your invitation has been sent successfully.",
      action: <ToastAction altText="Cancel invitation">Undo</ToastAction>,
    });
    const member = { ...staff.find(member => member.id === id) };
    setSendingInvitations([...sendingInvitations, id]);
    new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
      setSendingInvitations(sendingInvitations.filter(id => id !== member.id));
      setStaff(
        staff.map(member =>
          member.id === id ? { ...member, invited: action === "send" } : member,
        ),
      );
      toast({
        title: "Invitation sent",
        description: "Your invitation has been sent successfully.",
        action: <ToastAction altText="Cancel invitation">Undo</ToastAction>,
      });
    });
  };

  return (
    <div className="relative m-6 min-h-screen rounded-xl bg-slate-50 p-4 text-gray-800 shadow-lg">
      {/* <section className="absolute top-0 left-0 w-full h-16 bg-primary">
				<div className="bg-primary text-white py-2 px-4 text-sm font-medium">
					<p className="animate-marquee whitespace-nowrap">
						Última hora: João Silva marca hat-trick na vitória por 3-0 contra o FC Rival! 🎉 | Novo patrocinador
						anunciado para a próxima temporada 💼 | Ingressos para o próximo jogo já estão à venda online! 🎟️
					</p>
				</div>

				<div className="relative bg-gray-200 h-48 mb-8">
					<div className="absolute inset-0 flex items-center justify-between px-4">
						<button className="bg-white rounded-full p-2 shadow-md">
							<ChevronLeft className="h-6 w-6 text-primary" />
						</button>
						<button className="bg-white rounded-full p-2 shadow-md">
							<ChevronRight className="h-6 w-6 text-primary" />
						</button>
					</div>
					<div className="absolute inset-0 flex items-center justify-center">
						{banners.length > 0 ? (
							<img src={banners[0].image} alt={banners[0].title} className="w-full h-full object-cover" />
						) : (
							<p className="text-2xl font-sans text-gray-400">Espaço para Slide de Banners</p>
						)}
					</div>
					{hasEditPermission && (
						<Button
							onClick={() => addBanner("/new-banner.jpg", "Novo Banner")}
							className="absolute bottom-2 right-2 bg-primary text-white"
						>
							<Plus className="h-4 w-4 mr-2" /> Adicionar Banner
						</Button>
					)}
				</div>
			</section> */}

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <header className="mb-8 text-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={teamData.image || noImage}
                  alt={teamData.name}
                  className="h-32 w-32 rounded-xl object-cover"
                  width={200}
                  height={200}
                />

                <Button
                  variant="ghost"
                  className="absolute bottom-0 left-0 right-0 hover:bg-gray-50/35"
                >
                  <Camera className="h-6 w-6 text-gray-600" />
                </Button>
              </div>

              <div className="text-left">
                <h1 className="mb-2 font-sans text-4xl text-green-800">
                  {teamData.name}
                </h1>
                <p className="mx-auto max-w-md text-gray-600">{teamData.bio}</p>
              </div>
            </div>
          </header>

          <div className="mb-8 flex flex-col items-start justify-between md:flex-row">
            <Card className="mb-4 w-full overflow-hidden rounded-lg bg-white shadow-md md:mb-0 md:mr-4">
              <CardHeader className="bg-primary py-2">
                <CardTitle className="flex items-center justify-center text-lg font-semibold text-white">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Button onClick={prevEvent} variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button onClick={nextEvent} variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {events[currentEventIndex] && (
                  <div>
                    <p className="font-semibold">
                      {events[currentEventIndex].title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {events[currentEventIndex].type}
                    </p>
                    <p className="text-sm">
                      {new Date(
                        events[currentEventIndex].date,
                      ).toLocaleDateString()}{" "}
                      - {events[currentEventIndex].time}
                    </p>
                    <p className="text-sm text-gray-600">
                      {events[currentEventIndex].location}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Tabs defaultValue="team" className="mx-auto w-full">
          <TabsList className="mb-6 grid w-full grid-cols-6 rounded-lg bg-primary p-1">
            {[
              { value: "team", icon: Trophy, label: "Equipe" },
              { value: "competitions", icon: Award, label: "Competições" },
              { value: "players", icon: Users, label: "Jogadores" },
              { value: "statistics", icon: BarChart2, label: "Estatísticas" },
              { value: "schedule", icon: CalendarDays, label: "Calendário" },
              { value: "news", icon: Newspaper, label: "Notícias" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-xl text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="players">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center font-sans text-2xl">
                  <Users className="mr-2 h-6 w-6 text-primary" />
                  Elenco
                </CardTitle>
                {hasEditPermission && (
                  <Button
                    onClick={() =>
                      addPlayer("Novo Jogador", "Posição", 0, "🏴")
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Jogador
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {players.map(jogador => (
                    <li
                      key={jogador.id}
                      className="flex items-center rounded-lg bg-gray-50 p-3"
                    >
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-sans text-white">
                        {jogador.number}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {jogador.name} {jogador.nationality}
                        </p>
                        <p className="text-sm text-gray-600">
                          {jogador.position}
                        </p>
                      </div>
                      {jogador.invited && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleInvite(jogador.id, "player")}
                          className="ml-auto"
                        >
                          <Send className="mr-1 h-4 w-4" /> Convidar
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-sans text-2xl">
                  <BarChart2 className="mr-2 h-6 w-6 text-primary" />
                  Estatísticas da Temporada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    { label: "Jogos", value: 20, icon: Activity },
                    { label: "Vitórias", value: 12, icon: Trophy },
                    { label: "Empates", value: 5, icon: Activity },
                    { label: "Derrotas", value: 3, icon: Activity },
                    { label: "Gols marcados", value: 35, icon: Trophy },
                    { label: "Gols sofridos", value: 18, icon: Activity },
                  ].map(({ label, value, icon: Icon }, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-gray-50 p-4 text-center"
                    >
                      <Icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                      <p className="font-sans text-2xl">{value}</p>
                      <p className="text-sm text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center font-sans text-2xl">
                  <CalendarDays className="mr-2 h-6 w-6 text-primary" />
                  Calendário de Eventos
                </CardTitle>
                {hasEditPermission && (
                  <Button
                    onClick={() =>
                      addEvent(
                        "Evento",
                        "Novo Evento",
                        new Date().toISOString().split("T")[0],
                        "00:00",
                        "Local",
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Evento
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {events.map(evento => (
                    <li
                      key={evento.id}
                      className="flex items-center rounded-xl bg-white p-4 shadow-md dark:bg-slate-800"
                    >
                      <div className="mr-4 text-center">
                        <p className="font-sans text-lg">
                          {new Date(evento.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">{evento.time}</p>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{evento.title}</p>
                        <p className="text-sm text-gray-600">{evento.type}</p>
                        <p className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4" />
                          {evento.location}
                        </p>
                      </div>
                      <div className="space-x-2">
                        {evento.type === "Jogo" && (
                          <Button variant="outline" size="sm">
                            <Info className="mr-1 h-4 w-4" /> Ver Detalhes
                          </Button>
                        )}
                        {hasEditPermission && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              onClick={() => console.log(evento.id)}
                            >
                              <Edit2 className="mr-1 h-4 w-4" /> Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              onClick={() => console.log(evento.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Apagar
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-sans text-2xl">
                  <Newspaper className="mr-2 h-6 w-6 text-primary" />
                  Últimas Notícias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-6">
                  {[
                    {
                      title: "Novo Reforço Chega ao Time",
                      content:
                        "O atacante internacional Lucas Mendes se junta ao elenco para a próxima temporada.",
                      date: "10/06/2024",
                    },
                    {
                      title: "Vitória Impressionante no Clássico",
                      content:
                        "Estrelas do Futebol FC vence rival por 3x0 em jogo emocionante.",
                      date: "05/06/2024",
                    },
                    {
                      title: "Renovação de Contrato",
                      content:
                        "Capitão da equipe, Carlos Silva, renova contrato por mais 3 anos.",
                      date: "01/06/2024",
                    },
                  ].map((noticia, index) => (
                    <li key={index} className="rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-2 text-xl font-semibold text-green-700">
                        {noticia.title}
                      </h3>
                      <p className="mb-2 text-gray-600">{noticia.content}</p>
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {noticia.date}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-sans text-2xl">
                  <Trophy className="mr-2 h-6 w-6 text-primary" />
                  Dados da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(teamData).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={key} className="font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id={key}
                          value={value}
                          onChange={e =>
                            setTeamData({ ...teamData, [key]: e.target.value })
                          }
                          className="w-64"
                          disabled={!hasEditPermission}
                        />
                        {hasEditPermission && (
                          <Button variant="ghost" size="icon" className="ml-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-xl font-semibold">
                    Comissão Técnica
                  </h3>
                  {hasEditPermission && (
                    <Button
                      onClick={() => setIsShowAddStaff(true)}
                      className="mb-4"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Membro
                    </Button>
                  )}
                  <ul className="space-y-4">
                    {staff.map(member => (
                      <li
                        key={member.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-1"
                      >
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-600">
                            {t(`roles.${member.role}`)}
                          </p>
                        </div>
                        {member.invited && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendInvitation(member.id)}
                          >
                            <Send
                              className={cn("mr-1 h-4 w-4", {
                                "animate-pulse": sendingInvitations.includes(
                                  member.id,
                                ),
                              })}
                            />{" "}
                            {t("global.toInvite")}
                          </Button>
                        )}
                        {!member.invited && (
                          <div className="flex items-center gap-1">
                            <Button
                              disabled={!hasEditPermission}
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenShareModal(member.id)}
                            >
                              <Share2 className={cn("mr-1 h-4 w-4")} />
                            </Button>
                            <Button
                              disabled={!hasEditPermission}
                              variant="outline"
                              size="sm"
                              onClick={() => sendInvitation(member.id)}
                            >
                              <Repeat2
                                className={cn("mr-1 h-4 w-4", {
                                  "animate-spin": sendingInvitations.includes(
                                    member.id,
                                  ),
                                })}
                              />
                            </Button>
                            <Button
                              disabled={!hasEditPermission}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                confirm(
                                  `Tem certeza que deseja remover o membro ${member.name}?`,
                                ) && removeMember(member.id)
                              }
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center font-sans text-2xl">
                  <Award className="mr-2 h-6 w-6 text-primary" />
                  Competições
                </CardTitle>
                {hasEditPermission && (
                  <Button
                    onClick={() => addCompetition("Nova Competição", 0, 0)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Competição
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {competitions.map(competition => (
                    <li
                      key={competition.id}
                      className="flex gap-4 rounded-lg border bg-gray-50 p-4"
                    >
                      <div>
                        <Image
                          className="object-cover"
                          src={competition?.image || noImage}
                          alt={competition?.name}
                          width={60}
                          height={60}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {competition.name}
                        </h3>
                        {competition.position && (
                          <p>Posição atual: {competition.position}º</p>
                        )}
                        {competition.points && (
                          <p>Pontos: {competition.points}</p>
                        )}
                        {competition.stage && (
                          <p>Fase atual: {competition.stage}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Button
              onClick={openConvocationModal}
              className="fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-primary p-4 text-white shadow-lg transition-colors duration-200 hover:bg-green-700"
            >
              <Users className="mr-2 h-6 w-6" />
              Fazer Convocatória
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isConvocationModalOpen}
        onOpenChange={setIsConvocationModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fazer Convocatória</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game" className="text-right">
                Jogo
              </Label>
              <Select onValueChange={handleGameSelection}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione o jogo" />
                </SelectTrigger>
                <SelectContent>
                  {events
                    .filter(event => event.type === "Jogo")
                    .map(game => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="players" className="text-right">
                Jogadores
              </Label>
              <div className="col-span-3">
                {players.map(player => (
                  <div key={player.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => handlePlayerSelection(player.id)}
                      className="mr-2"
                    />
                    <Label htmlFor={`player-${player.id}`}>{player.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={saveConvocation}>Salvar Convocatória</Button>
            <div>
              <Button
                onClick={() => exportConvocation("image")}
                className="mr-2"
              >
                Exportar Imagem
              </Button>
              <Button onClick={() => exportConvocation("pdf")} className="mr-2">
                Exportar PDF
              </Button>
              <Button onClick={() => shareConvocation("social")}>
                <Share2 className="mr-1 h-4 w-4" /> Compartilhar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isShowAddStaff}
        onOpenChange={() => setIsShowAddStaff(!isShowAddStaff)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Staff</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddStaff)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  {...register("name")}
                  placeholder="Name"
                  id="name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  {...register("email")}
                  placeholder="Email"
                  id="email"
                  type="email"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Função
                </Label>

                <FormField
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(item => (
                          <SelectItem key={item} value={item}>
                            {t(`roles.${item}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>
                <Save className="mr-1 h-4 w-4" /> Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!openShareModal}
        onOpenChange={() => setOpenShareModal(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Compartilhar</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="items-center space-y-1">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <div className="flex w-full gap-2">
                <Input
                  id="link"
                  value={`https://futebolclube.com/manager/teams/${openShareModal}`}
                  className="w-full flex-1"
                  readOnly
                />
                <Button
                  variant="link"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://futebolclube.com/manager/teams/${openShareModal}`,
                    );
                    setOpenShareModal(null);
                  }}
                  className=""
                >
                  <Copy className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
