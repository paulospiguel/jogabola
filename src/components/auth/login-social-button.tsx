"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  provider: "google" | "facebook";
  callbackUrl?: string;
  children?: ReactNode;
};

const LoginSocialButton = ({ children, provider, callbackUrl }: Props) => {
  const searchParams = useSearchParams();
  const previousUrl = searchParams.get("redirect");
  callbackUrl = previousUrl || callbackUrl;

  return (
    // biome-ignore lint: TODO: Need to implement key stroke shortcuts
    <Button
      variant={"outline"}
      size={"default"}
      onClick={async () => {
        signIn(provider, { redirect: true, callbackUrl });
      }}
    >
      {children}
    </Button>
  );
};

export default LoginSocialButton;
