"use client";
import { Button } from "@repo/ui/components/button";
import { useToast } from "@repo/ui/components/use-toast";

const TestPage = () => {
	const { toast } = useToast();
	return (
		<div>
			<Button
				onClick={() =>
					toast({
						title: "Título",
						description: "Descrição",
					})
				}
			>
				Teste
			</Button>
		</div>
	);
};

export default TestPage;
