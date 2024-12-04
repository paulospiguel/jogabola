"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import { cn } from "@repo/ui/utils";
import Autoplay, { type AutoplayOptionsType } from "embla-carousel-autoplay";
import * as React from "react";

type CardCarouselProps = {
  showControls?: boolean;
  classNameControls?: string;
  items: React.ReactNode[];
  options?: AutoplayOptionsType;
};

export function CardCarousel({
  showControls,
  items,
  options,
  classNameControls,
}: CardCarouselProps) {
  const plugin = React.useRef(
    Autoplay({
      ...options,
      delay: 2000,
      stopOnInteraction: true,
      playOnInit: false,
    }),
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="relative w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items?.map((item, index) => (
          <CarouselItem key={index}>
            <div className="flex items-center justify-center p-1">{item}</div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && (
        <div
          className={cn("flex w-min justify-center gap-2", classNameControls)}
        >
          <CarouselPrevious />
          <CarouselNext />
        </div>
      )}
    </Carousel>
  );
}
