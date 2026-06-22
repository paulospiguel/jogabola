import { ResultView } from "@/components/timer/result-view";

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  return <ResultView data={d ?? null} />;
}
