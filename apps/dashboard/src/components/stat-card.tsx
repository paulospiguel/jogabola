import { cn } from "@repo/ui/utils";

export function StatCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full flex-grow overflow-hidden rounded-2xl border p-4 shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
