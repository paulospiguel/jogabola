import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTransferByToken } from "@/actions/team-transfer.actions";
import { getCachedSession } from "@/lib/get-session";
import {
  TransferLanding,
  type TransferLandingInitial,
} from "./_components/transfer-landing";

// The token is the access: keep it out of search engines and referrers.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function TransferPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await getCachedSession();
  if (!session) {
    redirect(`/auth?next=${encodeURIComponent(`/transfer/${token}`)}`);
  }

  const result = await getTransferByToken({ token });
  const initial: TransferLandingInitial = result.success
    ? { ok: true, transfer: result.data }
    : { ok: false, code: result.error.code };

  return <TransferLanding initial={initial} token={token} />;
}
