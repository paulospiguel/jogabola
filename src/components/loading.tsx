import Image from "next/image";
// import ballLoading from "@/assets/animations/ball-loading.gif";
import jbLoading from "@/assets/animations/jb-loading.gif";
import { cn } from "@/lib/utils";

const sizes = {
  small: "w-8 h-8",
  medium: "w-12 h-12",
  large: "w-16 h-16",
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
      <div className={cn(sizes[size], "relative")}>
        <Image src={jbLoading} alt="alt" fill className="object-contain" />
      </div>
      {text && <span className="text-arena-text">{text}</span>}
    </div>
  );
};

export default Loading;
