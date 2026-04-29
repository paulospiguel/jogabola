"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import type { ComponentProps } from "react";
import logo from "@/assets/logos/jogabola-logo.svg";
import logoWhite from "@/assets/logos/jogabola-white.svg";
import newLogoAnimated from "@/assets/logos/logo_animado.gif";
import { COMPANY, TRANSLATION_KEYS } from "@/constants/app";
import { useJourneyRedirect } from "@/hooks/use-journey-redirect";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
  href?: string;
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
  href,
}) => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { redirectToJourney } = useJourneyRedirect();
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

  const handleClick = (e: React.MouseEvent) => {
    if (session?.user?.id && href === "/") {
      e.preventDefault();
      redirectToJourney();
    }
  };

  const content = (
    <>
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
    </>
  );

  if (!href) {
    return (
      <div className={cn("relative flex", logoSize, className)}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn("relative flex", logoSize, className)}
    >
      {content}
    </Link>
  );
};
