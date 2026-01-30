import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function AvatarPoligon({
  className,
  avatarImage,
  borderColor,
  label,
}: {
  className?: string;
  borderColor?: string;
  avatarImage: string;
  label: string;
}) {
  const clipPolygon = avatarImage
    ? "[clip-path:polygon(50%_0,_100%_25%,_100%_75%,_50%_100%,_0_75%,_0_25%)] rounded-none"
    : "rounded-full";

  return (
    <Avatar
      className={cn(
        borderColor,
        clipPolygon,
        "flex items-center justify-center p-0.5",
        className,
      )}
    >
      <AvatarImage
        src={avatarImage}
        className={cn(clipPolygon, "rounded-none")}
      />
      <AvatarFallback className={className}>{label}</AvatarFallback>
    </Avatar>
  );
}
