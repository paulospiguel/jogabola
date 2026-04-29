import type { TypeIcon } from "lucide-react";

const menuHome = {
  header: [
    {
      label: "menu.home",
      href: "/",
      icon: null,
    },
  ],
  footer: [
    {
      label: "menu.home",
      href: "/",
      icon: null,
    },
    {
      label: "menu.privacyAndTerms",
      href: "/",
      icon: null,
    },
  ],
} as {
  header: {
    label: string;
    href: string;
    isNew?: boolean;
    icon: typeof TypeIcon | null;
    isExternal?: boolean;
  }[];
  footer: {
    label: string;
    href: string;
    isNew?: boolean;
    icon: typeof TypeIcon | null;
    isExternal?: boolean;
  }[];
};

export default menuHome;
