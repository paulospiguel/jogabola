import { AppHeader } from "@/components/horizontal-header";

export default function FeedManager() {
  return (
    <div className="bg-backgroundPrimary dark:bg-backgroundPrimary-dark flex h-full w-full flex-col items-center">
      <AppHeader />
      <div className="mt-4 h-[85vh] w-full max-w-3xl overflow-auto px-4">
        PLAYER FEED
      </div>
    </div>
  );
}
