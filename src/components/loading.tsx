import Image from "next/image";
// import ballLoading from "@/assets/animations/ball-loading.gif";
import jbLoading from "@/assets/animations/jb-loading.gif";
import { cn } from "@/lib/utils";

const dimensionClasses = {
  small: "w-8 h-8",
  medium: "w-12 h-12",
  large: "w-16 h-16",
};

const imageSizes = {
  small: "32px",
  medium: "48px",
  large: "64px",
};

type Props = {
  text?: string;
  size?: "small" | "medium" | "large";
};

const Loading = ({ size = "small", text }: Props) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center p-2",
      )}
    >
      <div
        className={cn(dimensionClasses[size], "relative")}
        aria-hidden="true"
      >
        <Image
          src={jbLoading}
          alt=""
          fill
          sizes={imageSizes[size]}
          className="object-contain"
        />
      </div>
      {text && <span className="text-arena-text">{text}</span>}
    </div>
  );
};

export default Loading;
