const routes = {
  welcome: "/welcome",
  onbording: {
    myJourney: "/my-journey",
    createTeam: "/create-team",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  manager: {
    teams: "/manager/teams",
    team: "/manager/team",
    feed: "/manager/feed",
  },
  player: {
    feed: "/player/feed",
    teams: "/player/teams",
    team: "/player/team",
    joinTeam: "/player/join-team",
    journey: "/player/journey",
  },
} as const;

export default routes;
