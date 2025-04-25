import { cn } from "@/utils";
import Link from "next/link";
import { Logo } from "./logo";
import { DiscordIcon, Instagram, XTwitter } from "./icons";
import { getTranslations } from "next-intl/server";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";

type FooterProps = {
  className?: string;
};

export default async function Footer({ className }: FooterProps) {
  const t = await getTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("bg-teal-50 dark:bg-gray-800", className)}>
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="absolute end-4 top-4 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
          <a
            className="inline-block rounded-full bg-teal-600 p-2 text-white shadow-sm transition hover:bg-teal-500 sm:p-3 lg:p-4"
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
          <div>
            <div className="flex justify-center lg:justify-start">
              <Logo size="small" />
            </div>

            <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500 lg:text-left">
              {t(TRANSLATION_KEYS.COMPANY.DESCRIPTION)}
            </p>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:mt-0 lg:justify-end lg:gap-12">
            <li>
              <Link
                className="text-gray-700 transition hover:text-gray-700/75 dark:text-teal-700"
                href="/contact"
              >
                {t("footer.contact")}
              </Link>
            </li>

            <li>
              <Link
                className="text-gray-700 transition hover:text-gray-700/75 dark:text-teal-700"
                href="#"
              >
                {t("footer.faq")}
              </Link>
            </li>

            <li>
              <Link
                className="text-gray-700 transition hover:text-gray-700/75 dark:text-teal-700"
                href="#"
              >
                {t("footer.privacyPolicy")}
              </Link>
            </li>

            <li>
              <Link
                className="text-gray-700 transition hover:text-gray-700/75 dark:text-teal-700"
                href="/terms-and-conditions"
              >
                {t("footer.termsAndConditions")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-3 border-t border-gray-200 pt-4 sm:flex sm:items-center sm:justify-between">
          <p className="text-center text-sm text-gray-500 sm:text-left">
            {`Copyright © ${currentYear}. | ${COMPANY.LEGAL_NAME} - ${t("common.rights")}`}
          </p>

          <ul className="mt-4 flex justify-center gap-6 sm:mt-0 sm:justify-start">
            <li>
              <Link href={COMPANY.SOCIAL.INSTAGRAM} target="_blank">
                <Instagram className="h-6 w-6 dark:text-teal-700" />
              </Link>
            </li>
            <li>
              <Link href={COMPANY.SOCIAL.DISCORD} target="_blank">
                <DiscordIcon className="h-6 w-6 dark:text-teal-700" />
              </Link>
            </li>
            <li>
              <Link href={COMPANY.SOCIAL.TWITTER} target="_blank">
                <XTwitter className="h-6 w-6 dark:text-teal-700" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
