import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SquadClient } from "./_components/squad-client";

export default async function ArenaTeamsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";

  return <SquadClient userId={userId} />;
}
