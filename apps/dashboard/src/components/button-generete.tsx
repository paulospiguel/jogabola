import { Sparkles } from "@repo/ui/icons";

type GenerateButtonProps = {
	action: () => Promise<void>;
};

export default function GenerateButton({ action }: GenerateButtonProps) {
	return (
		<button
			onClick={action}
			type="button"
			aria-label="Generate AI Content"
			className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800"
		>
			<span className="relative flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
				<Sparkles className="h-5 w-5" />
				Generate AI Content
				<span className="absolute bottom-0 right-0 top-0 h-full w-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-50" />
			</span>
		</button>
	);
}
