interface MockNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export function buildMockNotifications(locale: string): MockNotification[] {
  const isPt = locale === "pt";
  const isEs = locale === "es";
  const isFr = locale === "fr";

  return [
    {
      id: "mock-1",
      type: "attendance_confirmed",
      title: isPt
        ? "**Ricardo Pinto** confirmou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Ricardo Pinto** confirmó su asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Ricardo Pinto** a confirmé sa présence pour le **Match vs Benfica B**"
            : "**Ricardo Pinto** confirmed attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: "mock-2",
      type: "attendance_confirmed",
      title: isPt
        ? "**Diogo Ferreira** confirmou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Diogo Ferreira** confirmó su asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Diogo Ferreira** a confirmé sa présence pour le **Match vs Benfica B**"
            : "**Diogo Ferreira** confirmed attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "mock-3",
      type: "attendance_refused",
      title: isPt
        ? "**Paulo Fernandes** recusou presença em **Jogo vs Benfica B**"
        : isEs
          ? "**Paulo Fernandes** rechazó la asistencia en **Partido vs Benfica B**"
          : isFr
            ? "**Paulo Fernandes** a décliné la présence pour le **Match vs Benfica B**"
            : "**Paulo Fernandes** declined attendance for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
    },
    {
      id: "mock-4",
      type: "attendance_reserve",
      title: isPt
        ? "**João Martins** ficou em reserva em **Jogo vs Benfica B**"
        : isEs
          ? "**João Martins** quedó en reserva en **Partido vs Benfica B**"
          : isFr
            ? "**João Martins** a été mis en réserve pour le **Match vs Benfica B**"
            : "**João Martins** was put in reserve for **Match vs Benfica B**",
      message: "",
      read: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000),
    },
    {
      id: "mock-5",
      type: "attendance_no_response",
      title: isPt
        ? "**Miguel Pereira** não respondeu a **Treino Tático**"
        : isEs
          ? "**Miguel Pereira** no respondió a **Entrenamiento Táctico**"
          : isFr
            ? "**Miguel Pereira** n'a pas répondu à l'**Entraînement Tactique**"
            : "**Miguel Pereira** did not respond to **Tactical Training**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: "mock-6",
      type: "event_created",
      title: isPt
        ? "**Treino Técnico** criado e convocatória enviada a **14 jogadores**"
        : isEs
          ? "**Entrenamiento Técnico** creado y convocatoria enviada a **14 jugadores**"
          : isFr
            ? "**Entraînement Technique** créé et convocation envoyée à **14 joueurs**"
            : "**Technical Training** created and callup sent to **14 players**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "mock-7",
      type: "attendance_confirmed",
      title: isPt
        ? "**Bruno Alves** confirmou presença em **Treino Técnico**"
        : isEs
          ? "**Bruno Alves** confirmó su asistencia en **Entrenamiento Técnico**"
          : isFr
            ? "**Bruno Alves** a confirmé sa présence pour l'**Entraînement Technique**"
            : "**Bruno Alves** confirmed attendance for **Technical Training**",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "mock-8",
      type: "player_added",
      title: isPt
        ? "**Marco Carvalho** adicionado ao plantel"
        : isEs
          ? "**Marco Carvalho** añadido a la plantilla"
          : isFr
            ? "**Marco Carvalho** ajouté à l'effectif"
            : "**Marco Carvalho** added to the squad",
      message: "",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];
}
