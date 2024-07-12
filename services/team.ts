const teamService = {
  getTeamInfo: async (teamId: string) => {
    const team = {
      isCompleted: false,
      teamName: "Team Name",
      bio: "Bio",
    };

    return team;

    // const team = await prisma.team.findUnique({
    //   where: {
    //     id: teamId
    //   }
    // });
    // return team;
  }
};

export default teamService;