import { GraduationCap, School, TypeIcon } from "lucide-react";

const menuHome = {
  header: [
    {
      label: "menu.home",
      href: "/",
      icon: null,
    },
    {
      label: "menu.ecosystem",
      href: "/ecosystem",
      icon: null,
    },
    {
      label: "menu.community",
      href: "/community",
      icon: null,
    },
    {
      label: "menu.marketplace",
      href: "/marketplace",
      icon: null,
    },
    {
      label: "menu.academy",
      href: "/academy",
      icon: GraduationCap,
    },
    {
      label: "menu.howItWorks",
      href: "/how-it-works",
      isNew: true,
      icon: null,
    },
  ],
  footer: [
    {
      label: "menu.about",
      href: "/about",
      icon: null,
    },
    {
      label: "menu.contact",
      href: "/contact",
      icon: null,
    },
    {
      label: "menu.privacy",
      href: "/privacy",
      icon: null,
    },
    {
      label: "menu.terms",
      href: "/terms",
      icon: null,
    },
    {
      label: "menu.academy",
      href: "/academy",
      icon: GraduationCap,
    },
    {
      label: "menu.blog",
      href: "/blog",
      icon: null,
    },
  ],
} as {
  header: {
    label: string;
    href: string;
    isNew?: boolean;
    icon: typeof TypeIcon | null;
  }[];
  footer: {
    label: string;
    href: string;
    isNew?: boolean;
    icon: typeof TypeIcon | null;
  }[];
};

export default menuHome;
