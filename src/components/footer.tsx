import { cn } from "@/utils";
import Link from "next/link";
import { Logo } from "./logo";
import { DiscordIcon, Instagram, XTwitter } from "./icons";
import { getTranslations } from "next-intl/server";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";
import menuHome from "@/constants/menu-home";

type FooterProps = {
  className?: string;
};

export default async function Footer({ className }: FooterProps) {
  const t = await getTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/30",
        className,
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-200/15 blur-2xl" />
        <div className="absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-gradient-to-r from-teal-300/15 to-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {/* Back to top button */}
        <div className="absolute end-4 top-4 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
          <a
            className="inline-block rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/30 sm:p-4"
            href="#MainContent"
          >
            <span className="sr-only">Back to top</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <title>button up</title>
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <div className="lg:flex lg:items-end lg:justify-between">
          <div className="max-w-md">
            <div className="flex justify-center lg:justify-start">
              <Logo size="small" />
            </div>

            <p className="mx-auto mt-6 text-center leading-relaxed text-slate-600 lg:text-left dark:text-slate-300">
              {t(TRANSLATION_KEYS.COMPANY.DESCRIPTION)}
            </p>

            {/* Social links for mobile */}
            <div className="mt-6 flex justify-center gap-4 lg:hidden">
              <Link
                href={COMPANY.SOCIAL.INSTAGRAM}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <Instagram className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
              <Link
                href={COMPANY.SOCIAL.DISCORD}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <DiscordIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
              <Link
                href={COMPANY.SOCIAL.TWITTER}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <XTwitter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Navigation links */}
          <div className="mt-12 lg:mt-0">
            <ul className="flex flex-wrap justify-center gap-6 md:gap-8 lg:justify-end lg:gap-12">
              {menuHome.footer.map(item => {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      )}
                      {t(item.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-slate-200/60 pt-8 dark:border-slate-700/60">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-center text-sm text-slate-500 sm:text-left dark:text-slate-400">
              {`Copyright © ${currentYear}. | ${COMPANY.LEGAL_NAME} - ${t("common.rights")}`}
            </p>

            {/* Social links for desktop */}
            <div className="hidden gap-4 lg:flex">
              <Link
                href={COMPANY.SOCIAL.INSTAGRAM}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <Instagram className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
              <Link
                href={COMPANY.SOCIAL.DISCORD}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <DiscordIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
              <Link
                href={COMPANY.SOCIAL.TWITTER}
                target="_blank"
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 transition-all duration-300 hover:scale-110 hover:from-emerald-500/20 hover:to-teal-500/20"
              >
                <XTwitter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
