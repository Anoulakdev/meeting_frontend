import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  const url = `${apiBaseUrl}/api/auth/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: body.username, password: body.password }),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { message: "Invalid response from upstream server" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json(data);

  if (data.token) {
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
  }

  return response;
}
