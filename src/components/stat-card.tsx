import { cn } from "@/utils";

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
        "relative w-full grow overflow-hidden rounded-2xl border p-4 shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
