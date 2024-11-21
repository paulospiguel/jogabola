import { checkTeamByName } from "@/actions";
import { useCreateTeam } from "@/context/create-team-context";
import { teamSchema } from "@/schemas";
import { Button } from "@repo/ui/components/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { KeyboardEvent, useState } from "react";
import { Control } from "react-hook-form";
import { z } from "zod";
import { onCheckTeamName } from "./utils";

// export const teamSchema = z.object({
// 	name: z.string().min(3, "Nome do time deve ter pelo menos 3 caracteres"),
// 	foundationYear: z.coerce
// 		.number()
// 		.min(1850, "Ano de fundação deve ser após 1850")
// 		.max(new Date().getFullYear(), "Ano de fundação não pode ser no futuro"),
// 	colors: z.string().min(3, "Cores do time devem ter pelo menos 3 caracteres"),
// });

type TeamTypes = keyof z.infer<typeof teamSchema>;

type TeamNameProps = {
  control: Control<z.infer<typeof teamSchema>>;
};

export function TeamName({ control }: TeamNameProps) {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const {
    methods: { setError, clearErrors, getValues, getFieldState },
  } = useCreateTeam();

  const handleCheckTeamName = async (teamName: string) => {
    if (!teamName) {
      clearErrors("name");
      return;
    }

    const { hasError, errors } = await onCheckTeamName(teamName);

    if (hasError && errors) {
      setError("name", {
        message: Array.from(errors).join("<br />"),
      });
    } else {
      clearErrors("name");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const teamName = getValues("name")?.trim();
      handleCheckTeamName(teamName);
    }, 300);

    setTypingTimeout(newTimeout);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        rules={{ required: "Nome é obrigatório" }}
        render={({ field }) => (
          <FormItem className="flex-1">
            <Label htmlFor="team-name">Nome da equipa</Label>
            <FormControl>
              <Input
                {...field}
                id="team-name"
                required
                className="rounded-full"
                autoComplete="off"
                placeholder="Nomeie sua equipa com algo único!"
                aria-label="Nome da equipa"
                isError={!!getFieldState("name").invalid}
                onBlur={() => handleCheckTeamName(field.value)}
                onKeyDown={handleKeyDown}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
