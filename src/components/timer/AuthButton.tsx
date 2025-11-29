import { signIn, signOut } from "@/lib/auth-client";
import { LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

// Better Auth user type
type BetterAuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

interface AuthButtonProps {
  user: BetterAuthUser;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ user }) => {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/timer",
      });
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/timer");
            window.location.reload(); // Clear state for safety/simplicity
          },
        },
      });
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-1 pr-3 pl-1">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
            <span className="text-xs font-bold text-white">
              {user.name?.[0] || "U"}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="max-w-[80px] truncate text-[10px] leading-none font-bold text-slate-300">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-left text-[10px] leading-tight text-red-400 hover:text-red-300"
          >
            Logout <LogOut size={8} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500"
    >
      <LogIn size={14} />
      <span className="hidden sm:inline">Login / Sync</span>
      <span className="sm:hidden">Login</span>
    </button>
  );
};
