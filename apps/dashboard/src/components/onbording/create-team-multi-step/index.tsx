"use client";

import { type SubmitHandler, useFieldArray } from "react-hook-form";
import type z from "zod";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { TeamName } from "./step1";
import { AggreeTerms } from "./step2";
import { TeamInfo } from "./step3";
import type { teamSchema } from "@/schemas";
import { useCreateTeam } from "@/context/create-team-context";
import { createTeamAction } from "@/actions";
import { useToast } from "@repo/ui/components/use-toast";
import { useRouter } from "next/navigation";

// const formSchema = z.object({
//   team: teamSchema,
//   coach: coachSchema,
//   players: z
//     .array(playerSchema)
//     .min(1, "Time deve ter pelo menos 1 jogadores")
//     .max(23, "Time pode ter no máximo 23 jogadores"),
// });

//type FormData = z.infer<typeof teamSchema>;

export default function CreateTeamMultiStep() {
  const {
    STORAGE_KEY,
    methods: form,
    isClient,
    goToStep,
    currentStep: step,
  } = useCreateTeam();

  const { toast } = useToast();
  const { push } = useRouter();

  // const form = useForm<FormData>({
  // 	resolver: zodResolver(teamSchema),
  // 	defaultValues: {
  // 		name: "",
  // 		// team: { name: "", },
  // 		// coach: { name: "", age: 30, experience: 0 },
  // 		// players: Array(1).fill({ name: "", position: "", number: 1 }),
  // 	},
  // });

  // const { fields } = useFieldArray({
  // 	control: form.control,
  // 	name: "players",
  // });

  // const onSubmit: SubmitHandler<FormData> = (data) => {
  //   console.log(data);
  //   alert("Time criado com sucesso!");
  //   //localStorage.removeItem(STORAGE_KEY);
  //   // form.reset();
  //   // goToStep(1);
  // };

  const onSubmit: SubmitHandler<z.infer<typeof teamSchema>> = async values => {
    try {
      const result = await createTeamAction({
        values,
        //redirectTo: `manager/teams/${values.name}`,
      });

      if (result?.serverError) {
        throw new Error(result?.serverError);
      }

      if (result?.validationErrors?._errors) {
        throw new Error(result?.serverError);
      }

      toast({
        title: "Sucesso",
        variant: "success",
        description: "Sua equipa foi criada com sucesso!",
      });

      form.reset();
      localStorage.removeItem(STORAGE_KEY);
      result?.data?.slug
        ? push(`/manager/teams/${result?.data?.slug}`)
        : goToStep(1);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao criar o time";

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const nextStep = () => goToStep(step + 1);
  const prevStep = () => goToStep(step - 1);

  if (!isClient) {
    return <div>Carregando...</div>;
  }

  const isDisabledNextStep = () => {
    switch (step) {
      case 1:
        return form.watch("name").trim().length === 0;
      case 2:
        return form.watch("termsOfUse") === false;
      case 3:
        return false; //form.getValues();
      default:
        return false;
    }
  };

  return (
    <Card className="mx-auto w-full max-w-full bg-white">
      <CardHeader>
        <CardTitle>Criar Time de Futebol</CardTitle>
        <CardDescription>
          Preencha as informações do seu time em 3 etapas simples.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 flex-1 rounded ${step >= 1 ? "bg-primary" : "bg-muted"}`}
            >
              {" "}
            </div>
            <div
              className={`h-2 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`}
            >
              {" "}
            </div>
            <div
              className={`h-2 flex-1 rounded ${step >= 3 ? "bg-primary" : "bg-muted"}`}
            >
              {" "}
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Nome da Equipa</span>
            <span>Detalhes do Técnico</span>
            <span>Informações dos Jogadores</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <TeamName control={form.control} />}
            {step === 2 && <AggreeTerms control={form.control} />}
            {step === 3 && <TeamInfo control={form.control} />}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button type="button" onClick={prevStep} variant="outline">
            Anterior
          </Button>
        )}
        {step < 3 ? (
          <Button
            disabled={isDisabledNextStep()}
            type="button"
            onClick={nextStep}
            className="ml-auto"
          >
            Próximo
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="ml-auto"
          >
            Criar Time
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
