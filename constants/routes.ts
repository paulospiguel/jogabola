
const routes = {
  welcome: "/welcome",
  onbording: {
    myJourney: "/my-journey",
    createTeam: "/create-team",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  }
} as const;

export default routes;