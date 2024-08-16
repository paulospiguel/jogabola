"use client";

import { Steps } from "@/@types/multi-steps";
import gameDay from "@/assets/images/game_day.svg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useCreateTeam } from "@/hooks/use-create-team";
import type { teamSchema } from "@/schemas/create-team";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";

export const Step2 = React.forwardRef<HTMLDivElement>((props, ref) => {
  const form = useFormContext<z.infer<typeof teamSchema>>();

  const handleNextStep = () => {
    form.setValue("currentStep", Steps.Step3);
  };

  const isDisabled = form.watch("termsOfUse");

  return (
    <div ref={ref}>
      <Image
        src={gameDay}
        className="mx-auto"
        alt="sentado no sofa na torcida"
        width={280}
        height={280}
      />
      <div className="mx-auto max-w-md space-y-6 py-12">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Aceite os Termos de Uso</h2>
          <p className="text-slate-100">
            Antes de prosseguir, você precisa aceitar nossos Termos de Uso.
          </p>
        </div>
        <div className="space-y-4">
          <form className="w-full">
            <div className="space-y-4">
              <div className="flex w-full gap-2">
                <FormField
                  control={form.control}
                  name="termsOfUse"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          className="border-gray-50"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Eu aceito os Termos de Uso
                        </label>
                        <FormDescription className="text-sm text-slate-100">
                          Ao clicar em "Continuar", você concorda com nossos{" "}
                          <Link href="#" className="underline" prefetch={false}>
                            Termos de Uso
                          </Link>
                          .
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={!isDisabled}
                type="button"
                onClick={handleNextStep}
                variant={"default"}
                className="w-full bg-blue-950 hover:bg-blue-950/75"
              >
                <span>Avançar</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});
