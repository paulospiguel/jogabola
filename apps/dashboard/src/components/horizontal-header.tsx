import { Logo } from "./logo";
import { Navbar } from "./navbar";
import Notifications from "./notifications";
import LanguageSelector from "./language-selector";
import { cn } from "@repo/utils";

type HeaderProps = {
  className?: string;
};

export function AppHeader({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky flex h-[5rem] w-full items-center justify-center px-6",
        className,
      )}
    >
      <div className="flex h-[60px] w-full items-center justify-between rounded-2xl bg-white px-4 shadow-md dark:bg-slate-800">
        <Logo size="mini" />
        <div className="flex gap-2">
          <LanguageSelector />
          <Notifications />
          <Navbar />
        </div>
      </div>
    </header>
  );
}
