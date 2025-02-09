import Loading from "@/components/loading";
import { TabsContent } from "@repo/ui/components/tabs";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

type WrapperLayoutTabProps = {
  children: React.ReactNode;
  tabKey: string;
  className?: string;
};

export default function WrapperLayoutTab({
  children,
  tabKey,
  className,
}: WrapperLayoutTabProps) {
  const t = useTranslations();
  const title = `tabs.${tabKey}`;
  return (
    <TabsContent className={cn(className)} value={tabKey}>
      <h1 className="text-center text-2xl">{t(title)}</h1>
      <div className="my-2 flex flex-wrap items-center justify-center md:justify-end">
        {/* <AddNewPlayer /> */}
      </div>

      <Suspense fallback={<Loading />}>
        <section className="rounded-xl px-2 py-4 dark:bg-slate-800">
          {children}
        </section>
      </Suspense>
    </TabsContent>
  );
}
