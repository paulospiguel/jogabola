"use client";

import { getCookies } from "cookies-next";
import { signOut } from "next-auth/react";

export const fetchClient = async (
  input: string | Request | URL,
  options?: RequestInit,
) => {
  const jwt = getCookies("jwt");

  const res = await fetch(input, {
    ...options,
    headers: {
      ...options?.headers,
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
    },
  });

  if (res.status === 401) {
    await signOut();
  }

  return res;
};
