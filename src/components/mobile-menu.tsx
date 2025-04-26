"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import LanguageSelector from "./language-selector";
import AnimatedBorderTrail from "./animated-border-trail";
import { X } from "lucide-react";
// import { cn } from "@/lib/utils"; // unused

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { key: "header.home", href: "/" },
  { key: "header.plans", href: "#prices" },
  { key: "header.howItWorks", href: "#how-it-works" },
  { key: "header.about", href: "#about" },
];

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 md:hidden">
      <button
        onClick={onClose}
        aria-label="Close menu"
        className="absolute top-4 right-4 p-2"
      >
        <X size={24} />
      </button>
      <nav className="flex flex-col items-center space-y-6 text-xl font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={onClose}
            className="text-foreground hover:text-primary transition-colors"
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="mt-8 flex items-center gap-4">
        <ThemeToggle />
        <LanguageSelector />
      </div>
      <div className="mt-8">
        <AnimatedBorderTrail
          className="rounded-full"
          contentClassName="rounded-full transparent"
          trailColor="purple"
        >
          <Link href="/welcome" onClick={onClose}>
            <Button className="bg-primary dark:bg-teal-700 hover:text-secondary rounded-full px-4 py-2 whitespace-nowrap text-white shadow-md transition-all duration-150 ease-linear hover:brightness-110">
              {t("homePage.startMyJourney")}
            </Button>
          </Link>
        </AnimatedBorderTrail>
      </div>
    </div>
  );
}