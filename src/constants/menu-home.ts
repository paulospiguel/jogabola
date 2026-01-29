import { GraduationCap, Handshake, TypeIcon } from "lucide-react";

const menuHome = {
  header: [
    {
      label: "menu.home",
      href: "/",
      icon: null,
    },
    {
      label: "menu.team",
      href: "/team",
      icon: null,
    },
    {
      label: "menu.ecosystem",
      href: "/ecosystem",
      icon: null,
    },
    {
      label: "header.plans",
      href: "/plans",
      icon: null,
    },
    {
      label: "menu.community",
      href: "/community",
      icon: null,
    },
  ],
  footer: [
    {
      label: "menu.team",
      href: "/team",
      icon: null,
    },
    {
      label: "menu.about",
      href: "/about",
      icon: null,
    },
    {
      label: "menu.careers",
      href: "/careers",
      icon: null,
    },
    {
      label: "menu.contact",
      href: "/contact",
      icon: null,
    },
    {
      label: "menu.privacyAndTerms",
      href: "/privacy-and-terms",
      icon: null,
    },
    {
      label: "menu.academy",
      href: "/academy",
      icon: GraduationCap,
    },
    {
      label: "menu.becomePartner",
      href: "/become-partner",
      icon: Handshake,
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
