"use client";
import { useState } from "react";
import { ChevronDown, Settings, Menu } from "lucide-react";
import { Logo } from "./logo";
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
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSelector from "./language-selector";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import menuHome from "@/constants/menu-home";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = useTranslations();

  return (
    <header className="bg-trasparent flex w-full items-center justify-between px-4 py-2">
      {/* Header */}
      <div className="dark:bg-blue-850 flex w-full items-center justify-between rounded-full border bg-white px-6 py-2 shadow-md dark:border-gray-700">
        {/* Left side: Logo + Menu */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo size="small" isAnimate />
          </div>

          <Navbar className="hidden md:flex" />
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="hidden items-center gap-2 rounded-full bg-transparent px-3 py-1 text-sm text-blue-900 md:visible md:flex">
            <LanguageSelector />
          </div>

          {/* Launch Button */}
          <Link
            href="/welcome"
            className="hidden rounded-full bg-blue-800 px-4 py-2 font-semibold text-white shadow-md md:visible md:block dark:bg-teal-800"
          >
            {t("header.launchJourney")}
          </Link>

          {/* Settings Icon */}
          <Menubar className="hidden h-10 w-10 items-center justify-center p-0 md:flex">
            <MenubarMenu>
              <MenubarTrigger className="text-blue-800 transition hover:text-blue-900/80 dark:text-teal-600">
                <Settings size={20} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <ThemeToggle />
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Mobile menu button */}

          <Sheet>
            <SheetTrigger asChild>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-800 transition hover:text-blue-900/80 md:hidden"
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side={"right"} className="dark:bg-blue-850 h-screen">
              <SheetHeader>
                <SheetTitle>{"Menu"}</SheetTitle>
              </SheetHeader>
              <Navbar className="items-start space-y-2 py-4 text-xl font-bold" />
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
    </header>
  );
}

const Navbar = ({ className }: { className?: string }) => {
  const t = useTranslations();
  return (
    <nav
      className={cn(
        "flex flex-col items-center space-x-6 text-sm text-blue-900 md:flex-row dark:text-teal-600",
        className,
      )}
    >
      {menuHome.header.map(item => {
        return (
          <Link
            key={item.label}
            href={item.href}
            className="relative flex cursor-pointer items-center gap-1 hover:text-gray-300"
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
