import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/cn";

const polygonStyle = {
	clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
};

export default function AvatarPoligon({
	className,
	avatarImage,
	label,
}: { className?: string; avatarImage: string; label: string }) {
	return (
		<Avatar style={polygonStyle} className={cn(className, "p-0.5 flex items-center justify-center")}>
			<AvatarImage src={avatarImage} style={polygonStyle} className="shadow-none" />
			<AvatarFallback className={className}>{label}</AvatarFallback>
		</Avatar>
	);
}
