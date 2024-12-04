"use client";

import Image, { type StaticImageData } from "next/image";
import type { ComponentProps, FC } from "react";

import { cn } from "@repo/ui/utils";
import Link from "next/link";

import logoAnimated from "@/assets/animations/jogabola-loop.gif";
import logoGreen from "@/assets/logos/jogabola-green.svg";
import logo from "@/assets/logos/jogabola-logo.svg";
import logoWhite from "@/assets/logos/jogabola-white.svg";

const sizes = {
  mini: "w-20 h-20",
  small: "h-16 w-24",
  medium: "h-28 w-48",
  large: "h-36 w-72",
} as const;

type LogoProps = {
  className?: ComponentProps<"div">["className"];
  size?: keyof typeof sizes;
  isAnimate?: boolean;
  color?: "white" | "default" | "green" | "blue";
};

const imageColors = {
  white: logoWhite,
  green: logoGreen,
  blue: logo,
  default: logo,
};

export const Logo: FC<LogoProps> = ({
  color,
  className,
  isAnimate,
  size = "medium",
}) => {
  const logoSize = sizes[size];
  let logotipo: StaticImageData;

  if (isAnimate) {
    logotipo = logoAnimated;
  } else {
    switch (color) {
      case "white":
        logotipo = imageColors.white;
        break;
      case "green":
        logotipo = imageColors.green;
        break;
      case "blue":
        logotipo = imageColors.blue;
        break;
      default:
        logotipo = imageColors.default;
        break;
    }
  }

  return (
    <Link href="/" className={cn("relative flex", logoSize, className)}>
      <Image src={logotipo} alt="" fill className="object-contain" />
      <span className="sr-only">Jogabola - Encontre sua malta</span>
    </Link>
  );
};
