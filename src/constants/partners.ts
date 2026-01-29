import fieldLogo from "@/assets/partners/field.png";
import filaLogo from "@/assets/partners/fila.svg";
import redBullLogo from "@/assets/partners/redbull.svg";
import type { Partner, PartnerCategory } from "@/types/partners";

export const partners: Partner[] = [
  {
    name: "Field",
    logo: fieldLogo,
    website: "https://fieldsolutions.pt",
    category: "premium",
  },
  {
    name: "Fila",
    logo: filaLogo,
    website: "https://fila.com",
    category: "official",
  },
  {
    name: "Red Bull",
    logo: redBullLogo,
    website: "https://www.redbull.com",
    category: "supporter",
  },
];

export const partnersByCategory = partners.reduce<
  Record<PartnerCategory, Partner[]>
>(
  (acc, partner) => {
    acc[partner.category].push(partner);
    return acc;
  },
  {
    premium: [],
    official: [],
    supporter: [],
  },
);

