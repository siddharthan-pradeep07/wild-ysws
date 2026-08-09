import { NextRequest, NextResponse } from "next/server";
import { recordUserLogin } from "@/lib/users";
import { signSessionCookie } from "@/lib/sessionCookie";

export async function GET(request: NextRequest) 
{
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("oauth_state")?.value;

  if (!code) 
  {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }
  if (!returnedState || returnedState !== expectedState)
  {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  const tokenRes = await fetch("https://auth.hackclub.com/oauth/token", 
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.HACKCLUB_CLIENT_ID,
      client_secret: process.env.HACKCLUB_CLIENT_SECRET,
      redirect_uri: process.env.HACKCLUB_REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) 
  {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const userRes = await fetch("https://auth.hackclub.com/oauth/userinfo", 
  {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = await userRes.json();
  // user.email, user.name, user.sub

  // Best-effort — logging a login must never block the login itself, even
  // if Airtable or the Users table isn't set up yet.
  try
  {
    await recordUserLogin({
      name: user.name,
      email: user.email,
      slackId: user.slack_id,
    });
  }
  catch (err)
  {
    console.error("Failed to record user login:", err);
  }

  const response = NextResponse.redirect(new URL("/home", request.url));

  response.cookies.set("session_user", signSessionCookie({
    email: user.email,
    name: user.name,
    slack_id: user.slack_id,
    verification_status: user.verification_status,
    ysws_eligible: user.ysws_eligible,
    sub: user.sub
  }),
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  response.cookies.set("access_token", tokenData.access_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

  return response;
}