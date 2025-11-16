"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface EventImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  showControls?: boolean;
}

export function EventImageCarousel({
  images,
  alt = "Event image",
  className,
  showControls = true,
}: EventImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#0b1933] to-[#081326]",
          className,
        )}
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-white/40">Sem imagem</span>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden rounded-t-3xl",
          className,
        )}
      >
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div
      className={cn(
        "relative h-48 w-full overflow-hidden rounded-t-3xl",
        className,
      )}
    >
      <Carousel
        setApi={setApi}
        className="h-full w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="h-full basis-full">
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 h-6 w-6 border-white/20 bg-white/10 text-white hover:bg-white/20" />
            <CarouselNext className="right-2 h-6 w-6 border-white/20 bg-white/10 text-white hover:bg-white/20" />
          </>
        )}
      </Carousel>

      {/* Indicadores de página */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60",
              )}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
