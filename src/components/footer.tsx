import { COMPANY } from "@/constants/app";
import { cn } from "@/lib/utils";
import { ArrowRight, Instagram, MessageSquare, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "./logo";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: t("columns.product"),
      links: [
        { label: t("links.features"), href: "/ecosystem" },
        { label: t("links.plans"), href: "/plans" },
        { label: t("links.community"), href: "/community" },
      ],
    },
    {
      title: t("columns.institutional"),
      links: [
        { label: t("links.about"), href: "/about" },
        { label: t("links.contact"), href: "/contact" },
        { label: t("links.academy"), href: "/academy" },
        { label: t("links.partners"), href: "/become-partner" },
      ],
    },
    {
      title: t("columns.legal"),
      links: [
        { label: t("links.privacy"), href: "/privacy-policy" },
        { label: t("links.terms"), href: "/terms-and-conditions" },
        { label: t("links.cookies"), href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: COMPANY.SOCIAL.INSTAGRAM, label: "Instagram" },
    { icon: Twitter, href: COMPANY.SOCIAL.TWITTER, label: "Twitter" },
    { icon: MessageSquare, href: COMPANY.SOCIAL.DISCORD, label: "Discord" },
  ];

  return (
    <footer
      className={cn(
        "bg-background-dark border-t border-white/5 pt-24 pb-12",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-20 grid gap-16 lg:grid-cols-12">
          {/* Brand Info */}
          <div className="space-y-8 lg:col-span-5">
            <div className="flex items-center gap-3">
              <Logo variant="white" />
            </div>
            <p className="max-w-sm text-base leading-relaxed text-gray-400">
              {t("description")}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-gray-400 transition-all duration-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 active:scale-95"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerLinks.map((column, index) => (
              <div key={index} className="space-y-8">
                <h4 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="group relative flex items-center text-sm font-medium text-gray-400 transition-colors hover:text-white"
                      >
                        <span className="absolute -left-4 h-1.5 w-1.5 rounded-full bg-blue-500 opacity-0 transition-all group-hover:opacity-100" />
                        {link.label}
                        {link.href.startsWith("http") && (
                          <ArrowRight className="ml-1 h-3 w-3 -rotate-45 transform opacity-50 group-hover:opacity-100" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/5 pt-10 md:flex-row">
          <p className="text-sm font-medium text-gray-500">
            {t("copyright", { year: currentYear, company: COMPANY.NAME })}
          </p>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-3 text-[10px] font-black tracking-[0.25em] text-gray-600 uppercase">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              {t("systems")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
