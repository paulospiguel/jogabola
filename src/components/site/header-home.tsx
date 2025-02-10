import { Logo } from "@/components/logo";
import Link from "next/link";
import LanguageSelector from "../language-selector";
import { ThemeToggle } from "../theme-toggle";
import { DiscordIcon, XTwitter, Instagram } from "@/components/icons";
import { useTranslations } from "next-intl";
import AnimatedBorderTrail from "../animated-border-trail";
import { Button } from "@/components/ui/button";

export default function HeaderHome() {
  const t = useTranslations();
  return (
    <header className="flex w-full flex-col items-center justify-center gap-4 space-y-2 md:flex-row">
      <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Logo isAnimate size="small" />
      </div>
      <nav className="hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="text-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="#"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Preços
        </Link>
        <Link
          href="#"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Como funciona
        </Link>
        <Link
          href="#"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Buscar um time
        </Link>
        <Link
          href="#"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Competições
        </Link>
      </nav>
      <div className="flex w-full flex-col items-center justify-end gap-4 md:ml-auto md:flex-row md:gap-2 lg:gap-4">
        {/* <InputSearch /> */}

        <div className="ml-auto flex items-end gap-2">
          <Instagram className="h-6 w-6" />
          <DiscordIcon className="h-6 w-6" />
          <XTwitter className="h-6 w-6" />
        </div>
        <div className="flex gap-2">
          {/* <LoginBadge user={session?.user} /> */}
          <ThemeToggle />
          <LanguageSelector />
          <AnimatedBorderTrail
            className="rounded-full"
            contentClassName="rounded-full transparent"
            trailColor="purple"
          >
            <Link href="/welcome">
              <Button className="bg-primary hover:text-secondary rounded-full px-4 py-2 whitespace-nowrap text-white shadow-md transition-all duration-150 ease-linear hover:brightness-110">
                {t("homePage.getStarted")}
              </Button>
            </Link>
          </AnimatedBorderTrail>
        </div>
      </div>
    </header>
  );
}
