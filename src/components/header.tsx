import { Logo } from "@/components/logo";
import Link from "next/link";
import LanguageSelector from "./language-selector";
import { ThemeToggle } from "./theme-toggle";
import { DiscordIcon, XTwitter, Instagram, LuInstagram, LuDisc, LuTwitter } from "@/components/icons";
import { useTranslations } from "next-intl";
import AnimatedBorderTrail from "./animated-border-trail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeaderHome({ className }: { className?: string }) {
  const t = useTranslations();
  return (
    <header className={cn("dark:transparent flex w-full flex-col items-center justify-center gap-4 space-y-2 md:flex-row", className)}>
      <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Logo isAnimate size="small" />
      </div>
      <nav className="hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="text-foreground dark:hover:text-teal-700   hover:text-foreground transition-colors"
        >
          {t("header.home")}
        </Link>
        <Link
          href="#prices"
          className="text-muted-foreground dark:hover:text-teal-700  hover:text-foreground transition-colors"
        >
          {t("header.plans")}
        </Link>
        <Link
          href="#how-it-works"
          className="text-muted-foreground dark:hover:text-teal-700 hover:text-foreground transition-colors"
        >
          {t("header.howItWorks")}
        </Link>
        <Link
          href="#about"
          className="text-muted-foreground dark:hover:text-teal-700  hover:text-foreground transition-colors"
        >
          {t("header.about")}
        </Link>
      </nav>
      <div className="flex w-full flex-col items-center justify-end gap-4 md:ml-auto md:flex-row md:gap-2 lg:gap-4">
        <div className="flex gap-2">
          <ThemeToggle />
          <LanguageSelector />
          <AnimatedBorderTrail
            className="rounded-full"
            contentClassName="rounded-full transparent"
            trailColor="purple"
          >
            <Link href="/welcome">
              <Button className="bg-primary dark:bg-teal-700 hover:text-secondary rounded-full px-4 py-2 whitespace-nowrap text-white shadow-md transition-all duration-150 ease-linear hover:brightness-110">
                {t("homePage.startMyJourney")}
              </Button>
            </Link>
          </AnimatedBorderTrail>
        </div>
      </div>
    </header>
  );
}
