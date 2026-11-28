import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTransferByToken } from "@/actions/team-transfer.actions";
import { getCachedSession } from "@/lib/get-session";
import { isPreLaunchEligible } from "@/lib/launch-gate";
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

  // Same pre-launch gate as the (protected) layout: only testers can
  // become owners before launch (accept re-checks server-side).
  if (!(await isPreLaunchEligible(session.user.email))) {
    redirect("/waitlist");
  }

  const result = await getTransferByToken({ token });
  const initial: TransferLandingInitial = result.success
    ? { ok: true, transfer: result.data }
    : { ok: false, code: result.error.code };

  return <TransferLanding initial={initial} token={token} />;
}
