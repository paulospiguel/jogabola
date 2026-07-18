import { getCachedSession } from "@/lib/get-session";
import { ArenaDashboard } from "./_components/arena-dashboard";

export default async function ArenaPage() {
  const session = await getCachedSession();
  const userId = session?.user?.id ?? "";

  return <ArenaDashboard userId={userId} />;
}
