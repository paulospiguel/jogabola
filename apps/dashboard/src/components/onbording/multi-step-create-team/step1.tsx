"use client";

import { Steps } from "@/@types/multi-steps";
import { checkTeamName } from "@/actions/team";
import { checkTeamName } from "@/actions/team";
import { checkTeamName } from "@/actions/team";
import managerIcon from "@/assets/icons/director.png";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";put";s/create-team";
import Image from "next/image";
import React from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";

export const Step1 = React.forwardRef<HTMLDivElement>((props, ref) => {
  const form = useFormContext<z.infer<typeof teamSchema>>();

  const handleNextStep = () => {
    form.setValue("currentStep", Steps.Step2);
  };

  const handelCheckTeamName = async (teamName: string) => {
    const response = await checkTeamName(teamName);
    if (response.error) {
      form.setError("name", { message: response.error });
    } else {
      form.clearErrors("name");
    }
  };

  return (
    <div ref={ref}>
      <Image
        src={managerIcon}
        alt="Ícone de um diretor de futebol"
        width={100}
        height={100}
        className="mx-auto"
      />

      <h1 className="text-4xl mb-2 font-bold text-center mt-4">
        Crie sua equipa
      </h1>
      <div className="space-y-2 text-center">
        <p className="italic">
          Crie sua equipa e dispute competições, gerencie sua equipe e veja os
          resultados.
        </p>
        <p className="">Vamos dar o nome a próxima equipa campeã:</p>
      </div>

      <form className="w-full">
        <div className="flex w-full gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1">
                <FormLabel>Name da equipa</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    className="rounded-full"
                    autoComplete="off"
                    type="name"
                    placeholder="Nomeie sua equipa com algo único!"
                    isError={!!fieldState.error?.message}
                    onBlur={() => handelCheckTeamName(field.value)}
                  />
                </FormControl>
                <FormDescription className="hidden">
                  Nome da equipa.
                </FormDescription>
                <FormMessage />
                <Button
                  type="button"
                  onClick={handleNextStep}
                  variant={"default"}
                  disabled={fieldState.invalid || !field.value}
                  className="w-full bg-blue-950 hover:bg-blue-950/75"
                >
                  Avançar
                </Button>
              </FormItem>
            )}
          />
        </div>
      </form>
    </div>
  );
});
