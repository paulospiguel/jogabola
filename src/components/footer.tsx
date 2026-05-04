"use client";

import { Instagram, MessageSquare, Twitter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { APP } from "@/constants/app";
import { useHeaderButtons } from "@/hooks/use-header-buttons";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { XTwitter } from "./icons";
import { Logo } from "./logo";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const { data: session } = useSession();
  const { buttons, isLoading } = useHeaderButtons();
  const t = useTranslations("footer");
  const translation = useTranslations();

  const currentYear = new Date().getFullYear();

  const logoHref =
    session?.user?.id && !isLoading && buttons.length > 0 && buttons[0].href
      ? buttons[0].href
      : "/";

  const footerLinks = [
    {
      title: t("columns.product"),
      links: [
        { label: t("links.features"), href: "/#funcionalidades" },
        { label: t("links.plans"), href: "/#planos" },
      ],
    },
    {
      title: t("columns.institutional"),
      links: [
        { label: t("links.about"), href: "/#sobre" },
        { label: t("links.contact"), href: "/contact" },
      ],
    },
    {
      title: t("columns.legal"),
      links: [
        { label: t("links.terms"), href: "/terms" },
        { label: t("links.privacy"), href: "/privacy" },
        { label: t("links.disclaimer"), href: "/disclaimer" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: APP.SOCIAL.INSTAGRAM, label: "Instagram" },
    { icon: XTwitter, href: APP.SOCIAL.TWITTER, label: "XTwitter" },
    // { icon: MessageSquare, href: APP.SOCIAL.DISCORD, label: "Discord" },
  ];

  return (
    <footer
      className={cn(
        "border-t border-white/8 bg-[linear-gradient(180deg,#0a0b1e_0%,#080a25_100%)] pt-20 pb-10",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-20 grid gap-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div className="flex items-center gap-3">
              <Logo variant="white" className="h-16 w-28" href={logoHref} />
            </div>
            <p className="max-w-sm text-base leading-8 text-white/62">
              {t("description")}
            </p>
            <div className="flex gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-white/55 transition-colors duration-300 hover:border-neon-primary/25 hover:text-neon-primary active:scale-95"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerLinks.map(column => (
              <div key={column.title} className="space-y-8">
                <h4 className="text-xs font-bold tracking-[0.2em] text-white/38 uppercase">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-white/58 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/8 pt-10 md:flex-row">
          <p className="text-sm font-medium text-white/40">
            {t("copyright", {
              year: currentYear,
              company: translation(APP.COMPANY.NAME),
            })}
          </p>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-3 text-[10px] font-black tracking-[0.25em] text-white/36 uppercase">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-primary opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-neon-primary" />
              </span>
              {t("systems")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
