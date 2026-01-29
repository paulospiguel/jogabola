"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Calendar, MapPin, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

// Mock Data
const CLUB_DATA = {
  name: "STRIVING FOR EXCELLENCE",
  slogan: "The Elite Amateur Football Club",
  location: "London, UK",
  followers: "1.2k",
  following: "45",
  matchesWon: "12",
  isVerified: true,
  logo: "https://api.dicebear.com/7.x/identicon/svg?seed=striving",
  primaryColor: "#2563eb", // Default blue-600
};

const NEXT_MATCH = {
  homeTeam: {
    name: "City Rivals FC",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=rivals",
  },
  awayTeam: {
    name: "Club Professional",
    logo: "https://api.dicebear.com/7.x/identicon/svg?seed=pro",
  },
  date: "Oct 24, 2023 • 19:45",
  stadium: "St. James Park, London",
  countdown: { days: 2, hrs: 14, mins: 45 },
  status: "LIVE SOON",
};

const SQUAD = [
  {
    id: 1,
    name: "MARCUS SILVA",
    role: "STRIKER",
    number: "10",
    category: "attack",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
  {
    id: 2,
    name: "LEON GORETZKA",
    role: "MIDFIELDER",
    number: "08",
    category: "midfield",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leon",
  },
  {
    id: 3,
    name: "DAVID ALABA",
    role: "DEFENDER",
    number: "04",
    category: "defense",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    id: 4,
    name: "KASPER S.",
    role: "GOALKEEPER",
    number: "01",
    category: "defense",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kasper",
  },
];

const NEWS = [
  {
    id: 1,
    date: "OCT 18 • RESULTS",
    title: "Dominant 4-0 win in the local derby",
    type: "results",
  },
  {
    id: 2,
    date: "OCT 15 • TRAINING",
    title: "New training facility revealed",
    type: "training",
  },
  {
    id: 3,
    date: "OCT 12 • SQUAD",
    title: "Injury update: Silva returns to team",
    type: "squad",
  },
];

// Components
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-slate-950" />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-slate-950/0 via-slate-950/20 to-slate-950" />
  </div>
);

const SectionTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-6 flex items-center gap-3", className)}>
    <div className="h-6 w-1.5 rounded-full bg-(--primary-club) shadow-[0_0_10px_var(--primary-glow)]" />
    <h2 className="text-xl font-black tracking-tighter text-white uppercase">
      {children}
    </h2>
  </div>
);

export default function ClubSlugPage({ params }: { params: { slug: string } }) {
  console.log("Loading club page for slug:", params.slug);
  const t = useTranslations("clubPage");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery] = useState("");

  const filteredSquad = SQUAD.filter(
    player =>
      (activeTab === "all" || player.category === activeTab) &&
      player.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main
      className="relative min-h-screen bg-slate-950 pt-2 pb-20 font-sans selection:bg-(--primary-club)/30"
      style={
        {
          "--primary-club": CLUB_DATA.primaryColor,
          "--primary-glow": `${CLUB_DATA.primaryColor}80`, // 50% opacity for glow
        } as React.CSSProperties
      }
    >
      <GridBackground />

      {/* Club Navigation (Custom for Page) */}

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-12 md:px-6">
        {/* HERO HEADER */}
        <section className="mb-12 overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-[24px] border-4 border-(--primary-club)/20 bg-slate-900 p-6 shadow-2xl">
              <Image
                src={CLUB_DATA.logo}
                alt={CLUB_DATA.name}
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-(--primary-club)/20 bg-(--primary-club)/10 px-3 py-1">
                <BadgeCheck size={14} className="text-(--primary-club)" />
                <span className="text-[10px] font-black tracking-widest text-(--primary-club) uppercase">
                  VERIFIED CLUB
                </span>
              </div>
              <h1 className="mb-2 text-4xl leading-none font-black tracking-tight text-white uppercase md:text-6xl">
                {CLUB_DATA.name}
              </h1>
              <p className="mb-8 flex items-center gap-2 text-lg font-bold text-gray-400">
                {CLUB_DATA.slogan} •{" "}
                <span className="flex items-center gap-1 text-(--primary-club)">
                  <MapPin size={18} /> {CLUB_DATA.location}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl leading-none font-black text-white">
                    {CLUB_DATA.followers}
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("stats.followers")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl leading-none font-black text-white">
                    {CLUB_DATA.following}
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("stats.following")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl leading-none font-black text-white">
                    {CLUB_DATA.matchesWon}
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("stats.matchesWon")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button className="h-14 rounded-2xl bg-(--primary-club) px-12 text-lg font-black text-white shadow-[0_0_20px_var(--primary-glow)] transition-all hover:brightness-110">
                FOLLOW
              </Button>
              <Button
                variant="secondary"
                className="h-14 w-14 rounded-2xl border border-white/5 bg-white/5 p-0 text-white hover:bg-white/10"
              >
                <Share2 size={24} />
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* MAIN CONTENT (LEFT) */}
          <div className="lg:col-span-8">
            {/* NEXT MATCH */}
            <section className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <SectionTitle>{t("nextMatch.title")}</SectionTitle>
                <button className="text-xs font-black tracking-widest text-blue-500 uppercase hover:underline">
                  {t("nextMatch.fullSchedule")}
                </button>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-900/40 p-1 backdrop-blur-xl">
                <div className="relative rounded-[31px] bg-slate-950/80 p-8 md:p-12">
                  <div className="absolute top-6 right-6">
                    <span className="animate-pulse rounded-full border border-(--primary-club)/20 bg-(--primary-club)/10 px-3 py-1 text-[10px] font-black tracking-widest text-(--primary-club) uppercase">
                      {NEXT_MATCH.status}
                    </span>
                  </div>

                  <div className="grid items-center gap-12 md:grid-cols-3">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-(--primary-club)/20 bg-(--primary-club)/10 transition-transform group-hover:scale-110">
                        <Image
                          src={NEXT_MATCH.homeTeam.logo}
                          alt={NEXT_MATCH.homeTeam.name}
                          width={64}
                          height={64}
                        />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase">
                        {NEXT_MATCH.homeTeam.name}
                      </h3>
                    </div>

                    {/* VS / Timer */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="mb-6 text-sm font-black tracking-widest text-(--primary-club)">
                        VS
                      </span>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-white">
                            {String(NEXT_MATCH.countdown.days).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                            {t("nextMatch.countdown.days")}
                          </span>
                        </div>
                        <div className="text-2xl font-black text-gray-700">
                          :
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-white">
                            {String(NEXT_MATCH.countdown.hrs).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                            {t("nextMatch.countdown.hrs")}
                          </span>
                        </div>
                        <div className="text-2xl font-black text-gray-700">
                          :
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-white">
                            {String(NEXT_MATCH.countdown.mins).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                            {t("nextMatch.countdown.mins")}
                          </span>
                        </div>
                      </div>
                      <Button className="mt-8 h-12 rounded-xl bg-(--primary-club) px-8 font-black text-white transition-all hover:brightness-110">
                        {t("nextMatch.getTickets")}
                      </Button>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/5 bg-white/5 transition-transform group-hover:scale-110">
                        <Image
                          src={NEXT_MATCH.awayTeam.logo}
                          alt={NEXT_MATCH.awayTeam.name}
                          width={64}
                          height={64}
                        />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase">
                        {NEXT_MATCH.awayTeam.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-8 md:flex-row">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <MapPin size={16} /> {NEXT_MATCH.stadium}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <Calendar size={16} /> {NEXT_MATCH.date}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* THE LINEUP / SQUAD */}
            <section>
              <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                <SectionTitle className="mb-0">{t("squad.title")}</SectionTitle>
                <div className="flex rounded-xl border border-white/5 bg-white/5 p-1">
                  {["all", "attack", "midfield", "defense"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "rounded-lg px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all",
                        activeTab === tab
                          ? "bg-(--primary-club) font-black text-white shadow-(--primary-club)/20 shadow-lg"
                          : "text-gray-500 hover:text-white",
                      )}
                    >
                      {t(`squad.filters.${tab}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {filteredSquad.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-white/5 transition-all hover:border-(--primary-club)/50 hover:bg-white/10"
                    >
                      <div className="absolute top-3 left-3 z-20 h-10 w-10 overflow-hidden rounded-lg bg-(--primary-club) p-px">
                        <div className="flex h-full w-full items-center justify-center rounded-[7px] border border-white/10 bg-slate-900">
                          <span className="text-xl leading-none font-black text-(--primary-club) italic">
                            {player.number}
                          </span>
                        </div>
                      </div>

                      <div className="aspect-3/4 overflow-hidden">
                        <Image
                          src={player.image}
                          alt={player.name}
                          width={300}
                          height={400}
                          className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                        />
                      </div>

                      <div className="relative z-10 border-t border-white/5 bg-slate-900/80 p-4 backdrop-blur-md">
                        <h4 className="text-lg leading-tight font-black text-white uppercase">
                          {player.name}
                        </h4>
                        <span className="text-[10px] font-black tracking-widest text-(--primary-club) uppercase">
                          {player.role}
                        </span>
                      </div>

                      {/* Card Reflection Overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-white/10 via-white/0 to-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <aside className="space-y-12 lg:col-span-4">
            {/* CLUB BRIEFINGS */}
            <section>
              <SectionTitle>{t("news.title")}</SectionTitle>
              <div className="space-y-4">
                {NEWS.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="group flex cursor-pointer gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
                      <Image
                        src={`https://api.dicebear.com/7.x/abstract/svg?seed=${item.id}`}
                        alt="News"
                        width={64}
                        height={64}
                        className="brightness-75 group-hover:brightness-100"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-black tracking-widest text-(--primary-club) uppercase">
                        {item.date}
                      </span>
                      <h4 className="line-clamp-2 text-sm leading-tight font-bold text-white">
                        {item.title}
                      </h4>
                    </div>
                  </motion.div>
                ))}
                <button className="w-full rounded-2xl border border-white/5 py-3 text-[10px] font-black tracking-widest text-gray-500 uppercase transition-colors hover:border-white/10 hover:text-white">
                  {t("news.viewAll")}
                </button>
              </div>
            </section>

            {/* JOIN THE RANKS (RECRUITMENT) */}
            <section className="rounded-[32px] border border-(--primary-club)/10 bg-(--primary-club)/5 p-8 backdrop-blur-xl">
              <SectionTitle className="mb-2 text-(--primary-club)">
                {t("recruitment.title")}
              </SectionTitle>
              <p className="mb-8 text-sm font-medium text-gray-400">
                {t("recruitment.subtitle")}
              </p>

              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("recruitment.fields.name")}
                  </label>
                  <Input
                    placeholder={t("recruitment.fields.namePlaceholder")}
                    className="h-14 rounded-2xl border-white/5 bg-slate-900/50 px-6 font-bold text-white focus:border-(--primary-club)/50 focus:ring-(--primary-club)/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("recruitment.fields.position")}
                  </label>
                  <Select defaultValue="forward">
                    <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-slate-900/50 px-6 font-bold text-white focus:ring-(--primary-club)/20">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/10 bg-slate-900 text-white">
                      <SelectItem value="forward">Forward</SelectItem>
                      <SelectItem value="midfield">Midfield</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                    {t("recruitment.fields.experience")}
                  </label>
                  <textarea
                    placeholder={t("recruitment.fields.experiencePlaceholder")}
                    className="min-h-[120px] w-full resize-none rounded-2xl border border-white/5 bg-slate-900/50 px-6 py-4 font-bold text-white outline-hidden transition-all focus:border-(--primary-club)/50 focus:ring-2 focus:ring-(--primary-club)/20"
                  />
                </div>

                <Button className="h-14 w-full rounded-2xl bg-(--primary-club) text-lg font-black text-white shadow-[0_4px_15px_var(--primary-glow)] transition-all hover:brightness-110">
                  {t("recruitment.fields.submit")}
                </Button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
