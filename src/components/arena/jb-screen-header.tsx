"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface JbScreenHeaderProps {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}

export function JbScreenHeader({ title, right }: JbScreenHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 flex shrink-0 items-center gap-2.5 border-arena-border border-b bg-arena-bg px-5 pt-3 pb-2.5">
      <button
        className="flex p-0 text-arena-text-sec"
        onClick={() => router.back()}
        type="button"
      >
        <ArrowLeft size={20} />
      </button>
      <span className="flex-1 text-[17px] font-bold text-arena-text">
        {title}
      </span>
      {right}
    </div>
  );
}
