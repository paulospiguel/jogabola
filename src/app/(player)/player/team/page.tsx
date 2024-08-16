import { AppHeader } from "@/components/horizontal-header";

export default function SettingsManager() {
  return (
    <div className="flex flex-col w-full h-full items-center bg-backgroundPrimary dark:bg-backgroundPrimary-dark">
      <AppHeader />
      <div className="w-full px-4 mt-4 max-w-3xl h-[85vh] overflow-auto">
        FEED
      </div>
    </div>
  );
}
