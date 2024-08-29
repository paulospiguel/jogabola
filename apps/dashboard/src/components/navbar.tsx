import { auth } from "@auth";
import LoginBadge from "./auth/login-badge";

export const Navbar = async () => {
	const session = await auth();

	return <LoginBadge user={session?.user} />;
};
