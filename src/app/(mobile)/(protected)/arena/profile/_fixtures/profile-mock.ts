export const USER_STATS = [
  { value: "24", labelKey: "dashboard.games" },
  { value: "6", labelKey: "dashboard.goals" },
  { value: "7", labelKey: "dashboard.assists" },
  { value: "8.3", labelKey: "dashboard.rating" },
] as const;

export const INITIAL_TEAMS = [
  {
    id: 1,
    name: "FC Bairro Alto",
    role: "manager",
    league: "Liga Regional de Lisboa",
    color: "#7CFF4F",
    stats: [
      { value: "15", labelKey: "dashboard.playersCount" },
      { value: "2º", labelKey: "dashboard.position" },
      { value: "11", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: true,
  },
  {
    id: 2,
    name: "Sporting Bairro B",
    role: "coach",
    league: "Distrital de Lisboa",
    color: "#38BDF8",
    stats: [
      { value: "18", labelKey: "dashboard.playersCount" },
      { value: "5º", labelKey: "dashboard.position" },
      { value: "8", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: false,
  },
  {
    id: 3,
    name: "Os Amigos SC",
    role: "manager",
    league: "Liga Amigos",
    color: "#FACC15",
    stats: [
      { value: "14", labelKey: "dashboard.playersCount" },
      { value: "1º", labelKey: "dashboard.position" },
      { value: "13", labelKey: "dashboard.wins" },
      { value: "2024", labelKey: "dashboard.season" },
    ],
    expanded: false,
  },
] as const;
