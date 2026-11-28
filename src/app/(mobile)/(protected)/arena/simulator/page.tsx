import { getTranslations } from "next-intl/server";
import { MatchSimulator } from "./_components/match-simulator";

export default async function SimulatorPage() {
  const t = await getTranslations("matchSimulator");

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <h1 className="jb-title">{t("title")}</h1>
            <p className="mt-2 text-sm text-arena-text-sec">
              {t("description")}
            </p>
          </div>
        </header>
        <MatchSimulator />
      </div>
    </div>
  );
}
