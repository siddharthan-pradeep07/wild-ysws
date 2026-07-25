import {NextRequest, NextResponse} from "next/server";
export async function GET(request: NextRequest)
{
    const email = request.nextUrl.searchParams.get("email") ?? "";
    const authorizeUrl = new URL("https://auth.hackclub.com/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", process.env.HACKCLUB_CLIENT_ID!);
    authorizeUrl.searchParams.set("redirect_uri", process.env.HACKCLUB_REDIRECT_URI!);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid profile email name slack_id verification_status");

    const state = crypto.randomUUID();
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl.toString());

    response.cookies.set("pending_email", email, {httpOnly:true, maxAge:600, path: "/"});
    response.cookies.set("oauth_state", state, {httpOnly:true, maxAge:600, path: "/"});
    return response;
}