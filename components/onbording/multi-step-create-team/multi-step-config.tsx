"use client";

import type { z } from "zod";
import { Steps, type StepForm } from "@/types/multi-steps";
import { useCreateTeam } from "@/hooks/use-create-team";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { FormProvider } from "react-hook-form";
import { CreateTeamSchema } from "@/schemas/create-team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormPersist } from "@/hooks/use-form-persist";
import { useEffect, useMemo } from "react";
import { FormField } from "@/components/ui/form";

export const onboardingForm: Record<Steps, StepForm> = {
	[Steps.Step1]: {
		label: "Defina o nome da equipa",
		component: Step1,
		fields: [],
	},
	[Steps.Step2]: {
		label: "Defina as informações da equipa",
		component: Step2,
		fields: [],
	},
};

export function MultiStepCreateTeamConfig() {
	const { data, goToStep, setCreateTeamData, currentStep } = useCreateTeam();

	const methods = useFormPersist<z.infer<typeof CreateTeamSchema>>({
		storageKey: "create-team",
		resolver: zodResolver(CreateTeamSchema),
		includeDirtyFields: true,
		values: data,
		callback: (values) => {
			setCreateTeamData(values);
		},
	});

	const storagedCurrentStep = methods?.watch("currentStep");

	useEffect(() => {
		if (storagedCurrentStep !== currentStep) {
			goToStep(storagedCurrentStep);
		}
	}, [storagedCurrentStep, currentStep, goToStep]);

	const minStep = 1;
	const maxStep = Object.keys(onboardingForm).length;

	const Step = useMemo(() => {
		document.title = document.title.concat(` - ${onboardingForm[currentStep]?.label}`);
		return onboardingForm[currentStep]?.component;
	}, [currentStep]);

	if (!Step) {
		return null;
	}

	return (
		<FormProvider {...methods}>
			<FormField
				control={methods.control}
				name="currentStep"
				render={({ field }) => <input min={minStep} max={maxStep} type="number" {...field} className="hidden" />}
			/>
			<Step />
		</FormProvider>
	);
}
