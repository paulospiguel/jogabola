import z from "zod";

export const CreateTeamSchema = z.object({
  name: z.string().nonempty("Nome da equipa é obrigatório."),
});
