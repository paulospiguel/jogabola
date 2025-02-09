"use client";
import { getRolesByUser } from "@/actions/team";
import type { SessionRoles } from "@/types/roles";
import { useSession } from "next-auth/react";
import { useAction } from "next-safe-action/hooks";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

export type ProfileContextType = {
  userName: string;
  isLoggedIn: boolean;
  userRoles: SessionRoles;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [userRoles, setRoles] = useState<SessionRoles>({});

  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const userName = session?.user?.name || "";

  useAction(getRolesByUser, {
    executeOnMount: {
      input: { userId },
    },
    onSuccess: ({ data }) => {
      if (!data) {
        return;
      }

      setRoles(data);
    },
  });

  return (
    <ProfileContext.Provider
      value={{ isLoggedIn: !!session?.user, userName, userRoles }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
