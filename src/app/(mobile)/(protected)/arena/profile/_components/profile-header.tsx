"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { JbAvatar } from "@/components/arena/avatar";

interface ProfileHeaderProps {
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

export function ProfileHeader({
  userId,
  name,
  email,
  image,
}: ProfileHeaderProps) {
  const t = useTranslations("profilePage");

  return (
    <>
      <div className="flex flex-col items-center text-center mt-4 mb-2 relative">
        <div className="relative group">
          <div className="w-[88px] h-[88px] rounded-full border-2 border-arena-border p-1 bg-arena-bg-sec/50">
            <JbAvatar
              id={userId}
              name={name}
              image={image}
              size={76}
              className="rounded-full overflow-hidden"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-arena-bg p-[3px] rounded-full">
            <div className="w-[20px] h-[20px] bg-arena-primary rounded-full flex items-center justify-center shadow-lg">
              <ShieldCheck
                className="w-3.5 h-3.5 text-[#0B0F14]"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        <h1 className="text-xl font-extrabold font-sora mt-3 text-arena-text flex items-center gap-1.5 justify-center">
          {name}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-arena-primary/10 border border-arena-primary/30 text-arena-primary">
            {t("roles.manager")}
          </span>
          <span className="text-xs text-arena-text-muted select-all">
            {email}
          </span>
        </div>
      </div>
    </>
  );
}
