import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const isProduction = process.env.NODE_ENV === "production";

  // Clear the httpOnly token cookie by setting maxAge to 0
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
