"use client";

import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  text: string;
}

type TextFlipNewsProps = {
  newsItems: NewsItem[];
};

export default function TextFlipNews({ newsItems }: TextFlipNewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % newsItems.length);
        setIsFlipping(false);
      }, 500); // Half of the transition duration
    }, 5000); // Change news every 5 seconds

    return () => clearInterval(intervalId);
  }, [newsItems]);

  return (
    <div className="flex items-center space-x-2 overflow-hidden rounded-xl bg-gray-700 p-2 text-primary">
      <ArrowUpDown className="h-4 w-4 shrink-0" />
      <div className="relative h-6 grow overflow-hidden">
        {newsItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute w-full transition-all duration-1000 ${index === currentIndex
                ? "top-0 opacity-100"
                : index < currentIndex
                  ? "-top-full opacity-0"
                  : "top-full opacity-0"
              } ${isFlipping ? "pointer-events-none" : ""}`}
            style={{
              transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
              transformOrigin: "center center",
            }}
          >
            <p className="truncate text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
