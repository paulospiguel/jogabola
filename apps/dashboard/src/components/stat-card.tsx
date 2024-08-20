import { cn } from "@/utils";

export function StatCard({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("relative w-full overflow-hidden rounded-2xl p-4 border shadow-md flex-grow", className)}>
			{children}
		</div>
	);
}
