import type { Metadata } from "next";
import { buildTournamentMetadata } from "@/components/tournament/tournament-result";
import { TournamentResultView } from "@/components/tournament/tournament-result-view";
import { decodeTournamentResult } from "@/components/tournament/tournament-share";

interface TournamentResultadoPageProps {
  searchParams: Promise<{ d?: string }>;
}

export async function generateMetadata({
  searchParams,
}: TournamentResultadoPageProps): Promise<Metadata> {
  const { d } = await searchParams;
  const result = d ? decodeTournamentResult(d) : null;
  const metadata = buildTournamentMetadata(result);

  if (!metadata.description) {
    return { title: metadata.title };
  }

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      siteName: "JogaBola",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

export default async function TournamentResultadoPage({
  searchParams,
}: TournamentResultadoPageProps) {
  const { d } = await searchParams;

  return <TournamentResultView data={d ?? null} />;
}
