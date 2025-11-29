"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import menuHome from "@/constants/menu-home";
import { useHeaderButtons } from "@/hooks/use-header-buttons";
import { useJourneyRedirect } from "@/hooks/use-journey-redirect";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSelector from "./language-selector";
import { Logo } from "./logo";

const MAIN_DOMAIN = "jogabola.fun";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { redirectToJourney } = useJourneyRedirect();
  const { buttons, isLoading } = useHeaderButtons();

  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      if (isHome) {
        // Na home, muda de cor apenas quando passar da altura completa da viewport
        const viewportHeight = window.innerHeight;
        setIsScrolled(window.scrollY > viewportHeight);
      } else {
        // Em outras páginas, considera sempre como "scrolled" para manter o estilo verde
        setIsScrolled(true);
      }
    };

    // Executa imediatamente para páginas que não são home
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={cn(
        "fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-between px-4 py-2 transition-all duration-300",
        "bg-transparent",
      )}
    >
      {/* Header Container */}
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-full px-6 py-2 transition-all duration-300",
          "border-border-default bg-overlay-light border shadow-xl backdrop-blur-md",
        )}
      >
        {/* Left side: Logo + Menu */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo size="small" isAnimate />
          </div>

          <Navbar
            className="hidden md:flex"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div
            className={cn(
              "hidden items-center gap-2 rounded-full bg-transparent px-3 py-1 text-sm transition-colors duration-300 md:visible md:flex",
              "text-text-primary",
            )}
          >
            <LanguageSelector />
          </div>

          {/* Botões dinâmicos baseados no role */}
          {!isLoading &&
            buttons.map((button, index) => {
              if (button.href) {
                return (
                  <Link
                    key={index}
                    href={button.href}
                    className={cn(
                      "hidden rounded-full px-6 py-2 font-bold no-underline transition-all duration-300 hover:scale-105 md:visible md:block",
                      button.variant === "primary"
                        ? "bg-linear-to-r from-brand-green to-active-text text-[#21005a] shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40"
                        : "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40",
                    )}
                  >
                    {button.label.includes("header.")
                      ? t(button.label)
                      : button.label}
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  onClick={button.onClick || redirectToJourney}
                  className={cn(
                    "hidden rounded-full px-6 py-2 font-bold no-underline transition-all duration-300 hover:scale-105 md:visible md:block",
                    button.variant === "primary"
                      ? "bg-linear-to-r from-brand-green to-active-text text-[#21005a] shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40",
                  )}
                >
                  {button.label.includes("header.")
                    ? t(button.label)
                    : button.label}
                </button>
              );
            })}

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "transition-all duration-300 hover:scale-110 md:hidden",
                  "text-text-primary",
                )}
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={"right"}
              className="border-border-default bg-overlay-light text-text-primary h-screen w-full max-w-sm border-l shadow-[0_25px_60px_-40px_var(--color-shadow-neon-secondary)] backdrop-blur-xl"
            >
              {/* Header do Menu */}
              <div className="border-border-default flex items-center justify-between border-b pb-4">
                <SheetTitle className="from-neon-secondary to-accent-blue bg-linear-to-r bg-clip-text text-xl font-bold text-transparent">
                  ⚽ Menu
                </SheetTitle>
              </div>

              {/* Navegação */}
              <div className="flex-1 overflow-y-auto py-6">
                <Navbar
                  className="flex-col items-start space-y-3 text-base font-medium"
                  onItemClick={() => setIsMenuOpen(false)}
                />
              </div>

              {/* Footer com ações */}
              <SheetFooter className="border-border-default flex-col gap-3 border-t pt-4">
                {/* Botões dinâmicos baseados no role */}
                {!isLoading &&
                  buttons.map((button, index) => {
                    if (button.href) {
                      return (
                        <SheetClose key={index} asChild>
                          <Link
                            href={button.href}
                            className={cn(
                              "w-full rounded-full px-4 py-3 text-center text-sm font-bold no-underline transition-all duration-300 hover:scale-105",
                              button.variant === "primary"
                                ? "bg-linear-to-r from-brand-green to-active-text text-[#21005a] shadow-lg shadow-brand-green/20"
                                : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                            )}
                          >
                            {button.label.includes("header.")
                              ? t(button.label)
                              : button.label}
                          </Link>
                        </SheetClose>
                      );
                    }
                    return (
                      <SheetClose key={index} asChild>
                        <button
                          onClick={button.onClick || redirectToJourney}
                          className={cn(
                            "w-full rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 hover:scale-105",
                            button.variant === "primary"
                              ? "bg-linear-to-r from-brand-green to-active-text text-[#21005a] shadow-lg shadow-brand-green/20"
                              : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                          )}
                        >
                          {button.label.includes("header.")
                            ? t(button.label)
                            : button.label}
                        </button>
                      </SheetClose>
                    );
                  })}

                {/* Opções de idioma */}
                <div className="flex w-full items-center justify-center gap-4 pt-2">
                  <LanguageSelector />
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

const Navbar = ({
  className,
  onItemClick,
}: {
  className?: string;
  onItemClick?: () => void;
}) => {
  const t = useTranslations();
  const pathname = usePathname();

  // Define as cores baseado na página e estado de scroll
  const getTextColors = () => {
    return {
      default: "text-white font-semibold",
      hover: "hover:text-neon-secondary font-semibold",
    };
  };

  const colors = getTextColors();
  const isMobile = className?.includes("flex-col");

  return (
    <nav
      className={cn(
        "flex items-center space-x-6 text-sm transition-colors duration-300 md:flex-row",
        colors.default,
        className,
      )}
    >
      {menuHome.header.map(item => {
        const href = item.isExternal
          ? `https://${item.href}.${MAIN_DOMAIN}`
          : item.href;
        const isActive = pathname === item.href;

        const LinkComponent = isMobile ? (
          <SheetClose asChild>
            <Link
              key={item.label}
              href={href}
              onClick={onItemClick}
              className={cn(
                "relative flex w-full cursor-pointer items-center gap-2 rounded-xl border border-transparent px-4 py-3 text-left no-underline transition-all duration-300",
                isActive
                  ? "border-neon-secondary/40 bg-overlay-medium text-text-primary shadow-[0_25px_60px_-35px_var(--color-shadow-neon-primary)]"
                  : "text-text-secondary hover:border-border-hover hover:bg-overlay-light hover:text-text-primary",
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-neon-secondary" : "text-text-muted",
                  )}
                />
              )}
              <span className="flex-1">{t(item.label)}</span>
              {item.isNew && (
                <Badge className="rounded-full px-1 text-[10px] font-bold">
                  {t("header.new")}
                </Badge>
              )}
            </Link>
          </SheetClose>
        ) : (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "relative flex cursor-pointer items-center gap-1 no-underline transition-all duration-300 hover:scale-105",
              colors.hover,
            )}
          >
            {item.icon && <item.icon className="h-6 w-6" />}
            {t(item.label)}
            {item.isNew && (
              <span className="bg-yellow absolute -top-2 -right-5 rounded px-1 text-[10px] font-bold text-black dark:bg-yellow-400 dark:text-slate-900">
                {t("header.new")}
              </span>
            )}
          </Link>
        );

        return LinkComponent;
      })}
    </nav>
  );
};
