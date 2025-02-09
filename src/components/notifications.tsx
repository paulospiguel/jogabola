import { Bell } 
import { cn } from "@/utils";

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
