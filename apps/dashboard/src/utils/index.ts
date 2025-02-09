import { format } from "date-fns";
import { pt } from "date-fns/locale";
export * from "@repo/utils";

export const formatDate = (date: Date, locale?: string) => {
  return format(date, "dd/MM/yyyy", { locale: locale ? pt : undefined });
};
