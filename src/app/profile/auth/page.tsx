import UserSettingsForm from "@/components/auth/user-settings-form";
import { auth } from "@auth";

export default async function Settings() {
  const session = await auth();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <UserSettingsForm user={session?.user} />
    </div>
  );
}
