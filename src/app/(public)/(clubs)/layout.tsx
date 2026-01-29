import { Activity, Trophy, Users } from "lucide-react";
import Link from "next/link";

export default function ClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const t = useTranslations("clubPage");

  return (
    <div className="">
      {/* <nav className="relative z-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary-club) font-black text-white">
              JB
            </div>
            <div className="hidden items-center gap-6 md:flex">
              {["home", "matches", "squad", "news", "recruitment"].map(item => (
                <button
                  key={item}
                  className="text-sm font-bold tracking-wider text-gray-400 uppercase transition-colors hover:text-white"
                >
                  {t(`navigation.${item}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type="text"
                placeholder={t("navigation.searchPlaceholder")}
                className="h-10 w-64 rounded-xl border border-white/5 bg-white/5 pr-4 pl-10 text-xs font-medium text-white outline-hidden placeholder:text-gray-500 focus:border-(--primary-club)/50 focus:ring-2 focus:ring-(--primary-club)/20"
              />
            </div>
            <Button className="h-10 rounded-xl bg-(--primary-club) px-6 font-black tracking-tight text-white transition-all hover:brightness-110">
              FOLLOW
            </Button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-(--primary-club)/20 bg-gray-800">
              <Image
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manager"
                alt="User"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>
      </nav> */}

      {children}

      {/* FOOTER BAR (Custom) */}
      <footer className="mt-20 border-t border-white/5 bg-slate-950/50 py-8 backdrop-blur-md">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm font-black text-gray-500 italic">
            <Link href="/" className="text-(--primary-club)">
              JOGABOLA
            </Link>{" "}
            © 2026
          </div>
          <div className="flex items-center gap-6">
            {["PRIVACY POLICY", "TERMS OF SERVICE", "PLATFORM RULES"].map(
              item => (
                <button
                  key={item}
                  className="text-[10px] font-black tracking-widest text-gray-500 transition-colors hover:text-white"
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Users size={18} />
            <Trophy size={18} />
            <Activity size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
}
