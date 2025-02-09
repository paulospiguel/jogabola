import { auth } from "@auth";
import LoginBadge from "./auth/login-badge";

export async function Navbar() {
  const session = await auth();

  return <LoginBadge user={session?.user} />;
}
