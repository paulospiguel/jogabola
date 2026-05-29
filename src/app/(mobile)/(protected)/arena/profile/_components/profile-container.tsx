"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ProfileEditSheet } from "./profile-edit-sheet";
import { ProfileHeader } from "./profile-header";
import { ProfileMenu } from "./profile-menu";
import { ProfileNotificationsSheet } from "./profile-notifications-sheet";
import { ProfileSecuritySheet } from "./profile-security-sheet";
import { ProfileTeams } from "./profile-teams";

type ActiveSheet = "notifications" | "security" | "edit-profile" | null;

interface ProfileContainerProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    phone?: string;
  };
  realTeams: Array<{
    id: number;
    name: string;
    slug: string;
    location: string | null;
    role: string;
    memberCount: number;
  }>;
  passkeysCount: number;
}

export function ProfileContainer({
  user,
  realTeams,
  passkeysCount,
}: ProfileContainerProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[480px] mx-auto px-1 py-4">
      <ProfileHeader
        userId={user.id}
        name={user.name}
        email={user.email}
        image={user.image}
      />
      <ProfileTeams teams={realTeams} />
      <ProfileMenu onOpenSheet={sheet => setActiveSheet(sheet)} />

      <AnimatePresence>
        {activeSheet === "notifications" && (
          <ProfileNotificationsSheet onClose={() => setActiveSheet(null)} />
        )}
        {activeSheet === "edit-profile" && (
          <ProfileEditSheet user={user} onClose={() => setActiveSheet(null)} />
        )}
        {activeSheet === "security" && (
          <ProfileSecuritySheet
            passkeysCount={passkeysCount}
            onClose={() => setActiveSheet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
