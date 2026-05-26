"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <div className="sticky top-0 z-40 flex shrink-0 items-center gap-2.5 border-arena-border border-b bg-arena-bg px-5 pt-3 pb-2.5">
      <Button
        className="size-8 min-h-0 min-w-0 p-0 text-arena-text-sec hover:bg-transparent hover:text-arena-text"
        onClick={() => router.back()}
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("back")}
      >
        <ArrowLeft size={20} />
      </Button>
      <span className="flex-1 text-[17px] font-bold text-arena-text">
        {title}
      </span>
      {right}
    </div>
  );
}
