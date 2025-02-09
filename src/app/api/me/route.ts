import { getMe } from "@/actions/me";
import { auth } from "@auth";
import { NextResponse } from "next/server";

export const GET = auth(async req => {
  if (!req.auth)
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });

  const userId = req.auth?.user?.id;

  const me = userId ? await getMe(userId) : null;

  return NextResponse.json({ data: me });
});
