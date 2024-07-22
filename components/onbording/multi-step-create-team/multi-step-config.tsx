"use client";

import type { z } from "zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { Steps, type StepForm } from "@/types/multi-steps";
import { useCreateTeam } from "@/hooks/use-create-team";
import { cn } from "@/lib/utils";
import { teamSchema } from "@/schemas/create-team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormPersist } from "@/hooks/use-form-persist";
import { useEffect, useMemo } from "react";
import { FormField } from "@/components/ui/form";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { useSession } from "next-auth/react";
//import { useQuery } from "@tanstack/react-query";

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
	const { data, goToStep, setTeamData, currentStep, isCompleted, keyStorage } = useCreateTeam();
	const { data: session } = useSession();
	const user = session?.user;

	const { push } = useRouter();

	// const {
	// 	data: hasTeam,
	// 	isLoading,
	// 	isError,
	// } = useQuery({
	// 	enabled: !!user?.id,
	// 	queryFn: async () => user?.id && (await checkUserHasTeam(user?.id)),
	// 	queryKey: ["checkHasTeam"], //Array according to Documentation
	// });

	const methods = useFormPersist<z.infer<typeof teamSchema>>({
		storageKey: keyStorage,
		storageLocation: sessionStorage,
		resolver: zodResolver(teamSchema),
		includeDirtyFields: true,
		defaultValues: data,
	});

	const storagedCurrentStep = methods?.watch("currentStep");

	//console.log("Has Team", hasTeam);

	// useEffect(() => {
	// 	if (hasTeam) {
	// 		console.log("Has Team", hasTeam);
	// 		//push("/manager/teams");
	// 	}
	// }, [currentStep, hasTeam]);

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
				)}
			/>
			{MotionStep}
		</FormProvider>
	);
}
