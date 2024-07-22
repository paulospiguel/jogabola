import { auth } from "@/auth";
import LoginBadge from "./auth/login-badge";

export const Navbar = async () => {
	const session = await auth();

	return (
		<div>
			<LoginBadge user={session?.user} />
		</div>
	);
};
