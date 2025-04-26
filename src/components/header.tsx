"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import LanguageSelector from "./language-selector";
import { ThemeToggle } from "./theme-toggle";
// Removed unused social icons import
import { useTranslations } from "next-intl";
import AnimatedBorderTrail from "./animated-border-trail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MobileMenu from "./mobile-menu";

export default function HeaderHome({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <header className="bg-background sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b px-4 py-4 md:px-6 dark:border-zinc-800 dark:bg-black">
      <div
        className={cn(
          "flex w-full flex-col items-center justify-between gap-4 md:flex-row",
          className,
        )}
      >
        {/* Mobile Header */}
        <div className="flex w-full flex-col items-center justify-between space-y-4 md:hidden">
          <Logo isAnimate size="small" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector onlyIcon />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full items-center justify-between md:flex">
          <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Logo isAnimate size="small" />
          </div>
          <nav className="flex flex-col gap-6 text-lg font-medium md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
              href="/"
              className="text-foreground hover:text-foreground transition-colors dark:hover:text-teal-700"
            >
              {t("header.home")}
            </Link>
            <Link
              href="#prices"
              className="text-muted-foreground hover:text-foreground transition-colors dark:hover:text-teal-700"
            >
              {t("header.plans")}
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors dark:hover:text-teal-700"
            >
              {t("header.howItWorks")}
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors dark:hover:text-teal-700"
            >
              {t("header.about")}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
            <AnimatedBorderTrail
              className="rounded-full"
              contentClassName="rounded-full transparent"
              trailColor="purple"
            >
              <Link href="/welcome">
                <Button className="bg-primary hover:text-secondary rounded-full px-4 py-2 whitespace-nowrap text-white shadow-md transition-all duration-150 ease-linear hover:brightness-110 dark:bg-teal-700">
                  {t("homePage.startMyJourney")}
                </Button>
              </Link>
            </AnimatedBorderTrail>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </div>
    </header>
  );
}
