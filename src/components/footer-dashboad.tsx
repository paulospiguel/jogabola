import Link from "next/link";
import { useTranslations } from "next-intl";
import { useHeaderButtons } from "@/hooks/use-header-buttons";
import { useSession } from "@/lib/auth-client";
import { Logo } from "./logo";

export const FooterDashboard = () => {
  const { data: session } = useSession();
  const { buttons, isLoading } = useHeaderButtons();
  const t = useTranslations();

  const logoHref =
    session?.user?.id && !isLoading && buttons.length > 0 && buttons[0].href
      ? buttons[0].href
      : "/";

  return (
    <footer className="mt-14 border-white/8 bg-[#050312]/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:px-6">
        <div className="flex flex-col gap-2 border-t border-white/8 pt-4 text-xs text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo size="small" className="h-8 w-12" href={logoHref} />
            <span>
              {t("footer.copyright", {
                year: new Date().getFullYear(),
                company: "Jogabola",
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {[
              {
                href: "/",
                label: t("footer.links.terms"),
              },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-white/55 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
