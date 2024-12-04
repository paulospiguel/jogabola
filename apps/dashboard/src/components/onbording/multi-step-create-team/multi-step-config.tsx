"use client";

import { type StepForm, Steps } from "@/types";
import { Form, FormField } from "@repo/ui/components/form";
import { cn } from "@repo/ui/utils";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { useCreateTeam } from "@/context/create-team-context";
import { FormProvider } from "react-hook-form";

export const onboardingForm = {
  [Steps.Step1]: {
    label: "Defina o nome da equipa",
    component: Step1,
    fields: [],
  },
  [Steps.Step2]: {
    label: "Aceite os termos de uso",
    component: Step2,
    fields: [],
  },
  [Steps.Step3]: {
    label: "Defina as informações da equipa",
    component: Step3,
    fields: [],
  },
} satisfies Record<Steps, StepForm>;

export function MultiStepCreateTeamConfig({ isAddTeam = false }) {
  const { goToStep, currentStep, methods: form } = useCreateTeam();
  const storagedCurrentStep = form?.watch("currentStep");

  useEffect(() => {
    if (storagedCurrentStep !== currentStep) {
      goToStep(storagedCurrentStep);
    }
  }, [storagedCurrentStep, currentStep, goToStep]);

  const Step = useMemo(() => {
    const step = onboardingForm[currentStep];
    document.title = document.title.concat(` - ${step?.label}`);
    return step?.component;
  }, [currentStep]);

  if (!Step) {
    return null;
  }

  const MotionStep = useMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let RenderStep = motion<any>(Step);

    if (isAddTeam) {
      RenderStep = motion<any>(Step3);
    }

    return (
      <RenderStep
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0 }}
      />
    );
  }, [Step, isAddTeam]);

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="currentStep"
          render={({ field }) =>
            !isAddTeam ? (
              <ul className="flex w-full justify-center space-x-2 p-2">
                {Object.keys(onboardingForm).map((step, index) => {
                  const stepIndex = index + 1;
                  const isMatchStep = currentStep === stepIndex;
                  let disabledButton = false;

                  const formStep = Steps.Step3 === stepIndex;

                  if (formStep && !form.watch("termsOfUse")) {
                    disabledButton = true;
                  }

                  if (!form.watch("name")) {
                    disabledButton = true;
                  }

                  return (
                    <button
                      key={step}
                      type="button"
                      disabled={disabledButton}
                      onClick={() => form.setValue("currentStep", index + 1)}
                      className={cn("w-8 rounded-full bg-gray-300 py-1", {
                        "bg-gray-400": isMatchStep,
                      })}
                    />
                  );
                })}
              </ul>
            ) : (
              <></>
            )
          }
        />
        <section className="h-[85vh] overflow-auto pb-2">{MotionStep}</section>
      </Form>
    </FormProvider>
  );
}
