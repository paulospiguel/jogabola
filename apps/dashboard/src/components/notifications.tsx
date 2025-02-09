import { Bell } from "@repo/ui/icons";
import { cn } from "@repo/utils";

type NotificationsProps = {
  className?: string;
};

export default function Notifications({ className }: NotificationsProps) {
  return (
    <>
      <button
        type="button"
        className={cn("flex items-center justify-center", className)}
      >
        <Bell className="size-5 text-green-600" />
      </button>
    </>
  );
}
