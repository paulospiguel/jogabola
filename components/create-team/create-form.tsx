"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { newTeam } from "@/actions/create-team/new-team";
import { CreateTeamSchema } from "@/schemas/create-team";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function CreateTeamForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    resolver: zodResolver(CreateTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateTeamSchema>) => {
    startTransition(async () => {
      try {
        const { success, error } = await newTeam(values);
        if (error) setError(error);
        setSuccess(success || "");
        form.reset();
      } catch (error) {
        setSuccess("");
        setError("Algo deu errado.");
        form.reset();
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name da equipa</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-full"
                      autoComplete="off"
                      type="name"
                      placeholder="Nomeie sua equipa com algo único!"
                      required
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="hidden">Nome da equipa.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*  
              {error && <FormMessage type="error" message={error} title="Erro" />}
              {success && <FormMessage type="success" message={success} title="Sucesso" />} */}
            <Button variant={"default"} className="w-full bg-blue-950 hover:bg-blue-950/75" disabled={isPending}>
              <LoaderIcon className={!isPending ? "hidden" : "animate-spin mr-2"} />
              <span>Criar minha equipa</span>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
