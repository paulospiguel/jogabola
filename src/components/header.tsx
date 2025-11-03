"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Sheet,
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
import { Menu, Settings } from "lucide-react";
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

          {/* Settings Icon */}
          <Menubar className="hidden h-10 w-10 items-center justify-center p-0 md:flex">
            <MenubarMenu>
              <MenubarTrigger
                className={cn(
                  "transition-colors duration-300 hover:scale-110",
                  "text-black dark:text-white",
                )}
              >
                <Settings size={20} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/sign-in" className="w-full">
                    {t("header.signIn")}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

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
              className="h-screen bg-white/95 backdrop-blur-md dark:bg-slate-900"
            >
              <SheetHeader>
                <SheetTitle className="text-emerald-700 dark:text-emerald-400">
                  {"Menu"}
                </SheetTitle>
              </SheetHeader>
              <Navbar
                className="items-start space-y-2 py-4 text-xl font-bold"
                isScrolled={true}
                isHome={isHome}
              />
              <SheetFooter>
                <div className="my-4 flex gap-4">
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
}: {
  className?: string;
  isScrolled?: boolean;
  isHome?: boolean;
}) => {
  const t = useTranslations();

  // Define as cores baseado na página e estado de scroll
  const getTextColors = () => {
    return {
      default: "text-blue-850 dark:text-white font-semibold",
      hover: "hover:text-emerald-700 dark:hover:text-lime-700 font-semibold",
    };
  };

  const colors = getTextColors();

  return (
    <nav
      className={cn(
        "flex flex-col items-center space-x-6 text-sm transition-colors duration-300 md:flex-row",
        colors.default,
        className,
      )}
    >
      {menuHome.header.map(item => {
        return (
          <Link
            key={item.label}
            href={
              item.isExternal
                ? `https://${item.href}.${MAIN_DOMAIN}`
                : item.href
            }
            className={cn(
              "relative flex cursor-pointer items-center gap-1 transition-all duration-300 hover:scale-105",
              colors.hover,
            )}
          >
            {item.icon && <item.icon className="h-6 w-6" />}
            {t(item.label)}
            {item.isNew && (
              <span className="bg-yellow absolute -top-2 -right-5 rounded px-1 text-[10px] font-bold text-black">
                {t("header.new")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
