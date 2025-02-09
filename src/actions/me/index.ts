import db from "@/lib/db";

export const getMe = async (userId: string) => {
  const response = db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      team: true,
    },
  });
};
