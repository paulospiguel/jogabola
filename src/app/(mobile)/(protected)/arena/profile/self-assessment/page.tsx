import { redirect } from "next/navigation";
import { getMyRating } from "@/actions/player-ratings.actions";
import { getCachedSession } from "@/lib/get-session";
import { SelfAssessmentClient } from "./_components/self-assessment-client";

export default async function SelfAssessmentPage() {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const current = await getMyRating();

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <SelfAssessmentClient initial={current} />
      </div>
    </div>
  );
}
