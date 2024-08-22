"use client";

import { useCreateTeam } from "@/hooks/use-create-team";
import { type StepForm, Steps } from "@/types/multi-steps";
import { cn } from "@/utils";
import { FormField } from "@repo/ui/components/ui/form";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";

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

export function MultiStepCreateTeamConfig({ isAddTeam = false }) {
	const { goToStep, currentStep, methods } = useCreateTeam();

	const storagedCurrentStep = methods?.watch("currentStep");

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
		let RenderStep = motion(Step);

		if (isAddTeam) {
			RenderStep = motion(Step3);
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
		<FormProvider {...methods}>
			<FormField
				control={methods.control}
				name="currentStep"
				render={({ field }) =>
					!isAddTeam ? (
						<ul className="flex space-x-2 p-2 justify-center w-full">
							{Object.keys(onboardingForm).map((step, index) => {
								const stepIndex = index + 1;
								const isMatchStep = currentStep === stepIndex;
								let disabledButton = false;

								const formStep = Steps.Step3 === stepIndex;

								if (formStep && !methods.watch("termsOfUse")) {
									disabledButton = true;
								}

								if (!methods.watch("name")) {
									disabledButton = true;
								}

								return (
									<button
										key={step}
										type="button"
										disabled={disabledButton}
										onClick={() => methods.setValue("currentStep", index + 1)}
										className={cn("w-8 py-1 rounded-full bg-gray-300", {
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
			{MotionStep}
		</FormProvider>
	);
}
