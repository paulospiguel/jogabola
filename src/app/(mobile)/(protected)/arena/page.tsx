import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ArenaDashboard } from "./_components/arena-dashboard";

export default async function ArenaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  return <ArenaDashboard userId={userId} />;
}
