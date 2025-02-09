import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { cn } from "@/utils";
import { CircleUser }from "@/components/icons";

type AvatarPlayerProps = {
  playerImage: string;
};

export default function AvatarPlayer({ playerImage }: AvatarPlayerProps) {
  const borderColor = playerImage ? "bg-yellow-500 dark:bg-yellow-600" : "";
  const clipPolygon = playerImage
    ? "[clip-path:polygon(50%_0,_100%_25%,_100%_75%,_50%_100%,_0_75%,_0_25%)] rounded-none"
    : "rounded-full";

  return (
    <Avatar
      className={cn(
        borderColor,
        clipPolygon,
        "flex h-12 w-12 items-center justify-center p-0.5",
      )}
    >
      <AvatarImage
        src={playerImage}
        className={cn(clipPolygon, "rounded-none")}
      />
      <AvatarFallback className="bg-green-500">
        <CircleUser className="h-7 w-7" />
      </AvatarFallback>
    </Avatar>
  );
}
