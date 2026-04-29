import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { ArenaDashboardClient } from "./_components/arena-dashboard-client";

export default async function ArenaPage() {
  const t = await getTranslations("arenaDashboard");
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? t("defaultUser");
  const clubName = userName;

  return (
    <ArenaDashboardClient
      userId={userId}
      userName={userName}
      clubName={clubName}
    />
  );
}
