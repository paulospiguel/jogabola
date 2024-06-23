import Image, { StaticImageData } from "next/image";
import { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";

import logoAnimated from "@/assets/animations/jogabola_animation.gif";
import logo from "@/assets/logos/jogabola-logo.svg";

const sizes = {
  small: "h-14 w-24",
  medium: "h-28 w-48",
  large: "h-36 w-72",
} as const;

type LogoProps = {
  className?: ComponentProps<"div">["className"];
  size?: keyof typeof sizes;
  isAnimate?: boolean;
};

export const Logo: FC<LogoProps> = async ({
  className,
  isAnimate,
  size = "medium",
}) => {
  const logoSize = sizes[size];
  let logotipo: StaticImageData;

  if (isAnimate) {
    logotipo = logoAnimated;
  } else {
    logotipo = logo;
  }

  return (
    <Link href="/" className={cn(" relative", logoSize, className)}>
      <Image src={logotipo} alt="" fill className="object-fill" />
      <span className="sr-only">Jogabola - Encontre sua malta</span>
    </Link>
  );
};
