"use client";

import { cn } from "@/utils";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

type InfiniteHorizontalScrollProps = {
  images: string[];
  imageStyles?: {
    width?: number;
    height?: number;
    className?: React.ComponentProps<"img">["className"];
  };
};

const InfiniteHorizontalScroll: React.FC<InfiniteHorizontalScrollProps> = ({
  images,
  imageStyles,
}) => {
  const { className, height, width } = imageStyles || {
    className: "",
    width: 50,
    height: 50,
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
      <div
        x-data="{}"
        x-init="$nextTick(() => {
        let ul = $refs.logos;
        ul.insertAdjacentHTML('afterend', ul.outerHTML);
        ul.nextSibling.setAttribute('aria-hidden', 'true');
    		})"
        className="inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
      >
        <ul
          x-ref="logos"
          className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8"
        >
          {images?.map(srcImage => {
            return (
              <li
                key={uuidv4()}
                className={cn("flex items-center justify-center", className)}
              >
                <Image
                  src={srcImage}
                  alt="Picture of the author"
                  height={height}
                  width={width}
                />
              </li>
            );
          })}
        </ul>
        <ul
          x-ref="logos"
          className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8"
        >
          {images.map(srcImage => {
            return (
              <li
                key={uuidv4()}
                className={cn("flex items-center justify-center", className)}
              >
                <Image
                  src={srcImage}
                  alt="Picture of the author"
                  height={height}
                  width={width}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default InfiniteHorizontalScroll;
