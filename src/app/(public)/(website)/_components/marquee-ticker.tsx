"use client";

import { useTranslations } from "next-intl";
import { strokeTextStyle } from "./section-shell";

export function MarqueeTicker() {
  const t = useTranslations("homePage.marquee");
  const items = t.raw("items") as string[];
  const repeated = Array.from({ length: 4 }, (_, repeatIndex) =>
    items.map(item => ({ item, repeatIndex })),
  ).flat();

  return (
    <div className="overflow-hidden border-y border-arena-border bg-[#06090D] py-5">
      <div className="flex w-max gap-10 whitespace-nowrap animate-[marqueeScroll_38s_linear_infinite] motion-reduce:animate-none">
        {repeated.map(({ item, repeatIndex }, index) => (
          <div
            key={`${repeatIndex}-${item}`}
            className="flex items-center gap-10"
          >
            <span
              className="font-sora text-xl font-extrabold tracking-tight md:text-3xl"
              style={
                index % 2
                  ? strokeTextStyle("rgba(245,247,250,0.68)", 1)
                  : undefined
              }
            >
              {item}
            </span>
            <span className="size-2 rounded-full bg-arena-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}
