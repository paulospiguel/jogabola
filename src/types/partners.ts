import type { StaticImageData } from "next/image";

export type PartnerCategory = "premium" | "official" | "supporter";

export interface Partner {
  name: string;
  logo: StaticImageData | string;
  website?: string;
  category: PartnerCategory;
}

