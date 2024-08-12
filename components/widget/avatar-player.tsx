import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CircleUser } from "lucide-react";

type AvatarPlayerProps = {
	playerImage: string;
};

export default function AvatarPlayer({ playerImage }: AvatarPlayerProps) {
	const borderColor = playerImage ? "bg-yellow-500 dark:bg-yellow-600" : "";
	const clipPolygon = playerImage
		? "[clip-path:polygon(50%_0,_100%_25%,_100%_75%,_50%_100%,_0_75%,_0_25%)] rounded-none"
		: "rounded-full";

	return (
		<Avatar className={cn(borderColor, clipPolygon, " w-12 h-12 p-0.5 flex items-center justify-center")}>
			<AvatarImage src={playerImage} className={cn(clipPolygon, "rounded-none")} />
			<AvatarFallback className="bg-green-500">
				<CircleUser className="h-7 w-7" />
			</AvatarFallback>
		</Avatar>
	);
}
