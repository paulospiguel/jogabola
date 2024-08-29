"use client";
import { getRolesByUserId } from "@/actions/team";
import type { Role } from "@/schemas";
import { useSession } from "next-auth/react";
import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

export type ProfileContextType = {
	username: string;
	setUsername: (username: string) => void;
	userRoles: Role[];
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [username, setUsername] = useState("");
	const [userRoles, setRoles] = useState<Role[]>([]);
	const { data: session } = useSession();
	const userId = session?.user?.id;
	//const roles = session?.user.role as Role[];

	useEffect(() => {
		if (userId) {
			getRolesByUserId(userId).then((roles) => {
				setRoles(roles);
			});
		}
	}, [userId]);

	const values = useMemo(() => ({ username, setUsername, userRoles }), [username, userRoles]);

	return <ProfileContext.Provider value={values}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
	const context = useContext(ProfileContext);
	if (context === undefined) {
		throw new Error("useProfile must be used within a ProfileProvider");
	}
	return context;
};
