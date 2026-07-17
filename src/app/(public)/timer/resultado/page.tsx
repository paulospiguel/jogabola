import type { Metadata } from "next";
import { ResultView } from "@/components/timer/result-view";
import {
  decodeResult,
  resultOgDescription,
  resultOgTitle,
} from "@/components/timer/share";

type Props = { searchParams: Promise<{ d?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const r = d ? decodeResult(d) : null;
  if (!r) return { title: "Resultado · JogaBola" };
  const title = resultOgTitle(r);
  const description = resultOgDescription(r);
  return {
    title,
    description,
    openGraph: { title, description, siteName: "JogaBola", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ResultadoPage({ searchParams }: Props) {
  const { d } = await searchParams;
  return <ResultView data={d ?? null} />;
}
