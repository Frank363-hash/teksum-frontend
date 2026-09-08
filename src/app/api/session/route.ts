import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: { code: "DEPRECATED", message: "Direct session token exchange is no longer supported." } },
    { status: 410 },
  );
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("teksum_access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
