"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

const LogoutButton = ({ children }: Props) => {
  return (
    // biome-ignore lint: reason
    <div
      onClick={async () => {
        await signOut({
          redirect: true,
          callbackUrl: "/",
        });
      }}
    >
      {children}
    </div>
  );
};

export default LogoutButton;
