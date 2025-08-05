import ballLoading from "@/assets/animations/ball-loading.gif";
import { cn } from "@/lib/utils";
import Image from "next/image";

const sizes = {
  small: "w-10 h-10",
  medium: "w-12 h-12",
  large: "w-16 h-16",
};

type Props = {
  text?: string;
  size?: "small" | "medium" | "large";
};

const Loading = ({ size = "medium", text }: Props) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center justify-center p-2",
        sizes[size],
      )}
    >
      <Image src={ballLoading} alt="alt" width={100} height={100} />
      {text && <span>{text}</span>}
    </div>
  );
};

export default Loading;
