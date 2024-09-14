"use client";

import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { AlertTriangleIcon } from "@repo/ui/icons";
import { useRouter, useSearchParams } from "next/navigation";

const ErrorPage = () => {
	const search = useSearchParams();
	const router = useRouter();

	const error = search.get("error");

	return (
		<div className="flex flex-col w-full min-h-full items-center justify-center dark:bg-primary-dark bg-primary">
			<div className="space-y-4 flex flex-col items-center w-full max-w-xl mx-4">
				<Logo />
				<Alert className="flex flex-col items-center justify-center h-[200px] text-center">
					<AlertTitle className="mt-4 mb-1 text-lg flex gap-2">
						<AlertTriangleIcon className="size-[2rem] mr-0 stroke-orange-500" />
						<span className="text-2xl">Authentication Error!</span>
					</AlertTitle>
					<AlertDescription className="text-sm">{error}</AlertDescription>
				</Alert>
				<Button
					className="w-full text-secondary"
					variant="link"
					onClick={(e) => {
						e.preventDefault();
						router.push("/");
					}}
				>
					Ir para a página inicial
				</Button>
			</div>
		</div>
	);
};

export default ErrorPage;
