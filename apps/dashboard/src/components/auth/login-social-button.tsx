"use client";

import { Button } from "@repo/ui/components/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  provider:
    | "google"
    | "facebook"
    | "twitter"
    | "discord"
    | "telegram"
    | "apple";
  callbackUrl?: string;
  children?: ReactNode;
};

const LoginSocialButton = ({ children, provider, callbackUrl }: Props) => {
  const searchParams = useSearchParams();
  const previousUrl = searchParams.get("redirect");
  callbackUrl = previousUrl || callbackUrl;

  const handleLogin = async () => {
    await signIn(provider, { callbackUrl });
  };

  return (
    <Button
      variant={"outline"}
      size={"default"}
      className="border-none p-2"
      onClick={handleLogin}
      aria-label={`Sign in with ${provider}`}
    >
      {children}
    </Button>
  );
};

export default LoginSocialButton;
