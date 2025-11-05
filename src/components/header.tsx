"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import menuHome from "@/constants/menu-home";
import { useJourneyRedirect } from "@/hooks/use-journey-redirect";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSelector from "./language-selector";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const MAIN_DOMAIN = "jogabola.fun";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { redirectToJourney } = useJourneyRedirect();

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
          "border border-emerald-200/50 bg-white/90 shadow-xl backdrop-blur-md dark:border-emerald-700/30 dark:bg-slate-900/90",
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
            isScrolled={isScrolled}
            isHome={isHome}
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div
            className={cn(
              "hidden items-center gap-2 rounded-full bg-transparent px-3 py-1 text-sm transition-colors duration-300 md:visible md:flex",
              "text-black dark:text-white",
            )}
          >
            <LanguageSelector />
          </div>

          {/* Login Button */}
          <Link
            href="/sign-in"
            className={cn(
              "hidden rounded-full px-4 py-2 font-semibold shadow-md transition-all duration-300 hover:scale-105 md:visible md:block",
              "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
            )}
          >
            {t("header.signIn")}
          </Link>

          {/* Launch Button */}
          <button
            onClick={redirectToJourney}
            className={cn(
              "hidden rounded-full px-4 py-2 font-semibold shadow-md transition-all duration-300 hover:scale-105 md:visible md:block",
              "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-lime-700 dark:hover:bg-lime-800",
            )}
          >
            {t("header.launchJourney")}
          </button>

          <ThemeToggle />

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "transition-all duration-300 hover:scale-110 md:hidden",
                  "text-black dark:text-white",
                )}
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent
              side={"right"}
              className="h-screen w-full max-w-sm border-l border-emerald-100/60 bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_-40px_rgba(16,185,129,0.35)] dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_25px_60px_-40px_rgba(36,255,230,0.6)] text-slate-900 dark:text-white"
            >
              {/* Header do Menu */}
              <div className="flex items-center justify-between border-b border-emerald-100/60 pb-4 dark:border-white/10">
                <SheetTitle className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-xl font-bold text-transparent dark:from-[#24ffe6] dark:to-[#02a7ff]">
                  ⚽ Menu
                </SheetTitle>
              </div>

              {/* Navegação */}
              <div className="flex-1 overflow-y-auto py-6">
                <Navbar
                  className="flex-col items-start space-y-3 text-base font-medium"
                  isScrolled={true}
                  isHome={isHome}
                  onItemClick={() => setIsMenuOpen(false)}
                />
              </div>

              {/* Footer com ações */}
              <SheetFooter className="flex-col gap-3 border-t border-emerald-100/60 pt-4 dark:border-white/10">
                {/* Botão de Login */}
                <SheetClose asChild>
                  <Link
                    href="/sign-in"
                    className={cn(
                      "w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105",
                      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
                    )}
                  >
                    {t("header.signIn")}
                  </Link>
                </SheetClose>

                {/* Botão Launch Journey */}
                <SheetClose asChild>
                  <button
                    onClick={redirectToJourney}
                    className={cn(
                      "w-full rounded-full px-4 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105",
                      "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-lime-700 dark:hover:bg-lime-800",
                    )}
                  >
                    {t("header.launchJourney")}
                  </button>
                </SheetClose>

                {/* Opções de idioma e tema */}
                <div className="flex w-full items-center justify-center gap-4 pt-2">
                  <LanguageSelector />
                  <ThemeToggle />
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
  isScrolled,
  isHome,
  onItemClick,
}: {
  className?: string;
  isScrolled?: boolean;
  isHome?: boolean;
  onItemClick?: () => void;
}) => {
  const t = useTranslations();
  const pathname = usePathname();

  // Define as cores baseado na página e estado de scroll
  const getTextColors = () => {
    return {
      default: "text-blue-850 dark:text-white font-semibold",
      hover: "hover:text-emerald-700 dark:hover:text-lime-700 font-semibold",
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
                "relative flex w-full cursor-pointer items-center gap-2 rounded-xl border border-transparent px-4 py-3 text-left transition-all duration-300",
                isActive
                  ? "border-emerald-300 bg-emerald-100/70 text-emerald-700 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.45)] dark:border-[#24ffe6]/40 dark:bg-white/10 dark:text-white dark:shadow-[0_25px_60px_-35px_rgba(36,255,230,0.8)]"
                  : "text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-700 dark:text-white/70 dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-emerald-600 dark:text-[#24ffe6]"
                      : "text-slate-500 dark:text-white/60",
                  )}
                />
              )}
              <span className="flex-1">{t(item.label)}</span>
              {item.isNew && (
                <span className="bg-yellow absolute -top-2 -right-5 rounded px-1 text-[10px] font-bold text-black dark:bg-yellow-400 dark:text-slate-900">
                  {t("header.new")}
                </span>
              )}
            </Link>
          </SheetClose>
        ) : (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "relative flex cursor-pointer items-center gap-1 transition-all duration-300 hover:scale-105",
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
