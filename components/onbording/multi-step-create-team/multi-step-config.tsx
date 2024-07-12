"use client";

import type { z } from "zod";
import { Steps, type StepForm } from "@/types/multi-steps";
import { useCreateTeam } from "@/hooks/use-create-team";
import { FormProvider } from "react-hook-form";
import { CreateTeamSchema } from "@/schemas/create-team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormPersist } from "@/hooks/use-form-persist";
import { useEffect, useMemo } from "react";
import { FormField } from "@/components/ui/form";
import { domAnimation, LazyMotion, m, motion } from "framer-motion";

import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const onboardingForm: Record<Steps, StepForm> = {
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
};

export function MultiStepCreateTeamConfig() {
	const { data, goToStep, setCreateTeamData, currentStep, isCompleted } = useCreateTeam();
	const { push } = useRouter();

	const methods = useFormPersist<z.infer<typeof CreateTeamSchema>>({
		storageKey: "create-team",
		resolver: zodResolver(CreateTeamSchema),
		includeDirtyFields: true,
		defaultValues: data,
		callback: (values) => {
			if (JSON.stringify(data) !== JSON.stringify(values)) {
				setCreateTeamData(values);
			}
		},
	});

	const storagedCurrentStep = methods?.watch("currentStep");

	useEffect(() => {
		if (isCompleted) {
			push("/manage-team/team");
		}
	}, [isCompleted, push]);

	useEffect(() => {
		if (storagedCurrentStep !== currentStep) {
			goToStep(storagedCurrentStep);
		}
	}, [storagedCurrentStep, currentStep, goToStep]);

	const Step = useMemo(() => {
		document.title = document.title.concat(` - ${onboardingForm[currentStep]?.label}`);
		return onboardingForm[currentStep]?.component;
	}, [currentStep]);

	if (!Step) {
		return null;
	}

	const MotionStep = useMemo(() => {
		const RenderStep = motion(Step);
		return (
			<RenderStep
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { duration: 0.5 } }}
				exit={{ opacity: 0 }}
			/>
		);
	}, [Step]);

	return (
		<FormProvider {...methods}>
			<FormField
				control={methods.control}
				name="currentStep"
				render={({ field }) => (
					<ul className="flex space-x-2 p-2 justify-center w-full">
						{Object.keys(onboardingForm).map((step, index) => {
							const isMatchStep = currentStep === index + 1;
							return (
								<button
									key={step}
									type="button"
									onClick={() => methods.setValue("currentStep", index + 1)}
									className={cn("w-8 py-1 rounded-full bg-gray-300", {
										"bg-gray-400": isMatchStep,
									})}
								/>
							);
						})}
					</ul>
				)}
			/>
			{MotionStep}
		</FormProvider>
	);
}
