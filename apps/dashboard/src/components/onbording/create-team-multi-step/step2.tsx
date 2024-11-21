"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import gameDay from "@/assets/images/game_day.svg";
import { Steps } from "@/types";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { useCreateTeam } from "@/context/create-team-context";
import { Control } from "react-hook-form";
import { z } from "zod";
import { teamSchema } from "@/schemas";
import { Label } from "@repo/ui/components/label";

type AggreeTermsProps = {
  control: Control<z.infer<typeof teamSchema>>;
};

export const AggreeTerms = React.forwardRef<HTMLDivElement, AggreeTermsProps>(
  ({ control }, ref) => {
    return (
      <div ref={ref}>
        <Image
          src={gameDay}
          className="mx-auto"
          alt="sentado no sofa na torcida"
          width={130}
          height={80}
        />
        <div className="mx-auto space-x-4 space-y-6 text-xs">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold">Aceite os Termos de Uso</h2>
            <p className="text-slate-500 text-xs">
              Antes de prosseguir, você precisa aceitar nossos Termos de Uso.
            </p>
          </div>
          <FormField
            control={control}
            name="allowNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    className="border-green-600"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="notifications"
                    className="font-medium text-xs italic leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Aceito receber notificações
                  </Label>
                  <FormDescription className="text-xs">
                    Ao escoler essa opção, você receberá notificações sobre
                    novos eventos, atualizações e novidades.
                  </FormDescription>
                  <FormMessage className="text-red-500" />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="termsOfUse"
            render={({ field }) => (
              <>
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      className="border-green-600"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="termsOfUse"
                      className="text-xs italic font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Eu aceito os Termos de Uso
                    </Label>
                    <FormDescription id="termsOfUse" className="text-xs">
                      Ao clicar em "Continuar", você concorda com nossos{" "}
                      <Link href="#" className="underline" prefetch={false}>
                        Termos de Uso
                      </Link>
                      .
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </div>
                </FormItem>
              </>
            )}
          />
        </div>
      </div>
    );
  }
);
