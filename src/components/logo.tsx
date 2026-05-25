"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import type { ComponentProps } from "react";
import logo from "@/assets/logos/jogabola-logo.svg";
import logoWhite from "@/assets/logos/jogabola-white.svg";
import newLogoAnimated from "@/assets/logos/logo_animado.gif";
import { APP } from "@/constants/app";
import { useRouterUtils } from "@/hooks/use-router-utils";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const sizes = {
  mini: "w-16 h-20",
  small: "h-24 w-28",
  medium: "h-28 w-48",
  large: "h-36 w-72",
  header: "h-8 w-24",
} as const;

type LogoProps = {
  className?: ComponentProps<"div">["className"];
  size?: keyof typeof sizes;
  isAnimate?: boolean;
  variant?: "white" | "default";
  isBeta?: boolean;
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
  isBeta,
  size = "medium",
  href,
}) => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { redirectToJourney, redirectToHome } = useRouterUtils();
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
    if (href === "home") {
      e.preventDefault();
      return redirectToHome();
    }

    if (session?.user?.id && href === "/") {
      e.preventDefault();
      redirectToJourney();
    }

    if (href) {
      e.preventDefault();
      window.open(href, "_blank");
    }
  };

  const content = (
    <>
      <Image
        unoptimized
        src={logotipo}
        alt={t(APP.COMPANY.NAME)}
        fill
        className="object-contain"
      />
      <span className="sr-only">
        {t(APP.COMPANY.NAME)} — {t(APP.COMPANY.SLOGAN)}
      </span>
    </>
  );

  if (!href) {
    return (
      <div className={cn("relative flex", logoSize, className)}>{content}</div>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn("relative flex", logoSize, className)}
    >
      {content}

      {isBeta && (
        <span
          className={cn(
            "absolute rounded-full border border-[#7CFF4F]/25 bg-[#7CFF4F]/10 font-bold tracking-widest text-[#7CFF4F] uppercase",
            size === "header"
              ? "-right-2 -top-0.5 px-1.5 py-0.25 text-[8px]"
              : "-right-4 top-3 px-2 py-0.5 text-[10px]",
          )}
        >
          Beta
        </span>
      )}
    </Link>
  );
};
