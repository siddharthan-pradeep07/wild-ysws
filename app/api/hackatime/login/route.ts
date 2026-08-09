import { NextRequest, NextResponse } from "next/server";

// Only ever a same-site path — never let a query param send someone off
// this domain after OAuth completes.
function sanitizeReturnTo(value: string | null): string
{
    if (!value || !value.startsWith("/") || value.startsWith("//"))
    {
        return "/projects";
    }

    return value;
}

export async function GET(request: NextRequest)
{
    const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));

    const authorizeUrl = new URL("https://hackatime.hackclub.com/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", process.env.HACKATIME_CLIENT_ID!);
    authorizeUrl.searchParams.set("redirect_uri", process.env.HACKATIME_REDIRECT_URI!);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "read profile");

    const state = crypto.randomUUID();
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl.toString());
    const secure = process.env.NODE_ENV === "production";
    response.cookies.set("hackatime_oauth_state", state, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 600,
        path: "/",
    });
    response.cookies.set("hackatime_return_to", returnTo, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 600,
        path: "/",
    });

    return response;
}
