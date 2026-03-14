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
