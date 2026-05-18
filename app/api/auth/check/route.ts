import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/check
 * Reads the httpOnly "token" cookie, decodes the JWT payload,
 * checks expiry, and returns { roleId } if valid — or 401 if not.
 * Never exposes the raw token to the browser.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No token" }, { status: 401 });
  }

  try {
    // JWT is base64url encoded: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return NextResponse.json({ message: "Invalid token format" }, { status: 401 });
    }

    // Decode payload (index 1)
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadJson) as {
      exp?: number;
      roleId?: number;
      sub?: string | number;
    };

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Clear expired cookie
      const res = NextResponse.json({ message: "Token expired" }, { status: 401 });
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }

    const roleId = payload.roleId ?? null;

    return NextResponse.json({ roleId }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
