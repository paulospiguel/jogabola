import { FixtureDetail } from "../../../_components/fixture-detail";

interface FixturePageProps {
  params: Promise<{ fixtureId: string }>;
}

export default async function FixturePage({ params }: FixturePageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  return (
    <FixtureDetail fixtureId={Number.isSafeInteger(id) && id > 0 ? id : null} />
  );
}
