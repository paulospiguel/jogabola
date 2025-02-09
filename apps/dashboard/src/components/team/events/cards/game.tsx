import { EventTypes } from "@/types/events";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";

import noImage from "@/assets/images/JOGABOLA-shield.svg";

type GameCardContentProps = {
  title: string;
  type: EventTypes;
  datetime: Date;
  location: string;
  team: Record<string, string>;
  opponent: Record<string, string>;
  score: string;
  status: string;
};

export const GameCardContent = ({
  title,
  type,
  datetime,
  location,
  team,
  opponent,
  score,
  status,
}: GameCardContentProps) => {
  const t = useTranslations();
  const typeLabel = t("events.types.game");

  return (
    <>
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-gray-600">{typeLabel}</p>

      <div className="grid grid-cols-3 items-start gap-2">
        <div className="flex flex-col items-center justify-start gap-2">
          <Image
            src={team?.image || noImage}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <p className="text-sm text-gray-600">{team?.name || "N/A"}</p>
        </div>
        <div className="self-center text-3xl font-bold italic text-gray-600">
          VS
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <Image
            src={opponent?.image || noImage}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <p className="text-sm text-gray-600">{opponent?.name || "N/A"}</p>
        </div>
      </div>

      {datetime && (
        <p className="text-sm font-semibold italic">
          {format(datetime, "dd/MM/yyyy")} - {format(datetime, "HH:mm")}
        </p>
      )}
      <p className="text-gray-600">{location}</p>
    </>
  );
};
