"use client";
import { motion } from "framer-motion";
import { Badge, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_DOMAIN } from "@/configs";
import menuHome from "@/constants/menu-home";
import { useHeaderButtons } from "@/hooks/use-header-buttons";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import LanguageSelector from "./language-selector";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { buttons, isLoading } = useHeaderButtons();

  const t = useTranslations();

  const logoHref =
    session?.user?.id && !isLoading && buttons.length > 0 && buttons[0].href
      ? buttons[0].href
      : "/";

  useEffect(() => {
    const handleScroll = () => {
      if (isHome) {
        const viewportHeight = window.innerHeight;
        setIsScrolled(window.scrollY > viewportHeight);
      } else {
        setIsScrolled(true);
      }
    };

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
        "fixed top-0 right-0 left-0 z-50 px-4 py-4 transition-all duration-300",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between rounded-[28px] border px-4 py-2 transition-all duration-300 md:px-6 md:py-2.5",
          isScrolled
            ? "border-arena-border bg-[#06090D]/85 shadow-[0_18px_45px_-28px_rgba(124,255,79,0.25)] backdrop-blur-xl"
            : "border-arena-border/40 bg-arena-bg/40 backdrop-blur-md md:border-transparent md:bg-transparent md:backdrop-blur-none",
        )}
      >
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Logo
              size="small"
              isAnimate
              href={logoHref}
              className="h-11 w-16 shrink-0 md:h-12 md:w-20"
            />
          </div>

          {!isHome && <Navbar className="hidden md:flex" />}
        </div>

        <div className="flex items-center space-x-4">
          {!isLoading &&
            buttons.map(button => {
              const key = button.href || button.label;
              if (button.href) {
                return (
                  <Link
                    key={key}
                    href={button.href}
                    className={cn(
                      "hidden rounded-full px-5 py-2.5 no-underline transition-colors duration-300 md:visible md:block",
                      button.variant === "primary"
                        ? "bg-[#7CFF4F] font-semibold text-black hover:bg-[#6ee847]"
                        : "border border-white/10 bg-white/5 font-medium text-white/80 hover:text-white",
                    )}
                  >
                    {button.label.includes("header.")
                      ? t(button.label)
                      : button.label}
                  </Link>
                );
              }
              return (
                <Button
                  key={key}
                  onClick={button.onClick}
                  variant="ghost"
                  className={cn(
                    "hidden rounded-full px-5 py-2.5 no-underline transition-colors duration-300 md:visible md:flex",
                    button.variant === "primary"
                      ? "bg-[#7CFF4F] font-semibold text-black hover:bg-[#6ee847]"
                      : "border border-white/10 bg-white/5 font-medium text-white/80 hover:text-white",
                  )}
                >
                  {button.label.includes("header.")
                    ? t(button.label)
                    : button.label}
                </Button>
              );
            })}

          {session?.user && !isHome && (
            <div className="hidden md:block">
              <UserMenu
                user={
                  session.user as {
                    id: string | number;
                    name: string;
                    email: string;
                    image?: string | null;
                  }
                }
              />
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-2xl border border-white/8 bg-white/4 p-2 transition-colors duration-300 hover:bg-white/10 md:hidden",
                  "text-text-primary",
                )}
                aria-label={t("arena.header.openMenu")}
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={"right"}
              className="border-arena-border bg-[#06090D]/95 text-text-primary h-screen w-full max-w-sm border-l shadow-[0_25px_60px_-40px_rgba(124,255,79,0.25)] backdrop-blur-xl"
            >
              <div className="border-border-default flex items-center justify-between border-b pb-4">
                <SheetTitle className="text-xl font-semibold text-white">
                  Menu
                </SheetTitle>
              </div>

              {!isHome && (
                <div className="flex-1 overflow-y-auto py-6">
                  <Navbar
                    className="flex-col items-start space-y-3 text-base font-medium"
                    onItemClick={() => setIsMenuOpen(false)}
                  />
                </div>
              )}

              <SheetFooter className="border-border-default flex-col gap-3 border-t pt-4">
                {session?.user && !isHome && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <UserMenu
                      user={
                        session.user as {
                          id: string | number;
                          name: string;
                          email: string;
                          image?: string | null;
                        }
                      }
                    />
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                )}
                {!isLoading &&
                  buttons.map(button => {
                    const key = button.href || button.label;
                    if (button.href) {
                      return (
                        <SheetClose key={key} asChild>
                          <Link
                            href={button.href}
                            className={cn(
                              "w-full rounded-full px-4 py-3 text-center text-sm no-underline transition-colors duration-300",
                              button.variant === "primary"
                                ? "bg-[#7CFF4F] font-semibold text-black hover:bg-[#6ee847]"
                                : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
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
                      <SheetClose key={key} asChild>
                        <Button
                          onClick={button.onClick}
                          variant="ghost"
                          className={cn(
                            "w-full rounded-full px-4 py-3 text-sm transition-colors duration-300",
                            button.variant === "primary"
                              ? "bg-[#7CFF4F] font-semibold text-black hover:bg-[#6ee847]"
                              : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
                          )}
                        >
                          {button.label.includes("header.")
                            ? t(button.label)
                            : button.label}
                        </Button>
                      </SheetClose>
                    );
                  })}

                <div className="flex w-full items-center justify-center gap-4 pt-2">
                  <LanguageSelector />
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center">
            <LanguageSelector />
          </div>
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

  const getTextColors = () => {
    return {
      default: "text-white/72 font-medium",
      hover: "hover:text-white transition-colors",
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
        const key = item.label;
        const href = item.isExternal
          ? `https://${item.href}.${MAIN_DOMAIN}`
          : item.href;
        const isActive = pathname === item.href;

        const LinkComponent = isMobile ? (
          <SheetClose key={key} asChild>
            <Link
              href={href}
              onClick={onItemClick}
              className={cn(
                "relative flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-left no-underline transition-colors duration-300",
                isActive
                  ? "border-neon-primary/25 bg-white/6 text-text-primary"
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
            key={key}
            href={href}
            className={cn(
              "relative flex items-center gap-1 rounded-full px-3 py-2 no-underline transition-colors duration-300",
              isActive && "bg-white/6 text-neon-primary",
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
