import { getCachedSession } from "@/lib/get-session";
import { SquadClient } from "./_components/squad-client";

export default async function ArenaSquadPage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? "";

  return <SquadClient userId={userId} />;
}
