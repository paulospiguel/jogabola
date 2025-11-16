"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventImageCarouselProps {
  images?: string[];
  alt?: string;
  className?: string;
  showControls?: boolean;
}

export function EventImageCarousel({
  images = [],
  alt = "Event image",
  className,
  showControls = true,
}: EventImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayImages = images.length > 0 ? images : ["/images/login-stadium.jpg"];
  const hasMultipleImages = displayImages.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden", className)}>
      <Image
        src={displayImages[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={currentIndex === 0}
      />

      {showControls && hasMultipleImages && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentIndex
                    ? "w-6 bg-neon-secondary"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
      
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <p className="text-sm text-white/40 font-medium">Sem imagens disponíveis</p>
        </div>
      )}
    </div>
  );
}
