"use client";

import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import logo from "@/assets/logos/jogabola-logo.svg";
import logoWhite from "@/assets/logos/jogabola-white.svg";
import newLogoAnimated from "@/assets/logos/logo_animado.gif";
import React, { ComponentProps } from "react";

const sizes = {
  mini: "w-16 h-20",
  small: "h-24 w-28",
  medium: "h-28 w-48",
  large: "h-36 w-72",
} as const;

type LogoProps = {
  className?: ComponentProps<"div">["className"];
  size?: keyof typeof sizes;
  isAnimate?: boolean;
  variant?: "white" | "default";
};

const imageColors = {
  white: logoWhite,
  default: logo,
};

export const Logo: React.FC<LogoProps> = ({
  variant,
  className,
  isAnimate,
  size = "medium",
}) => {
  const t = useTranslations();
  const logoSize = sizes[size];
  let logotipo: StaticImageData;

  if (isAnimate) {
    logotipo = newLogoAnimated;
  } else {
    switch (variant) {
      case "white":
        logotipo = imageColors.white;
        break;
      default:
        logotipo = imageColors.default;
        break;
    }
  }

  return (
    <Link href="/" className={cn("relative flex", logoSize, className)}>
      <Image
        unoptimized
        src={logotipo}
        alt="Logo Jogabola"
        fill
        className="object-contain"
      />
      <span className="sr-only">
        {COMPANY.NAME} - {t(TRANSLATION_KEYS.COMPANY.SLOGAN)}
      </span>
    </Link>
  );
};
