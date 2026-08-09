import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { setHackatimeConnected, setHackatimeProjects } from "@/lib/users";

// Response shape isn't fully pinned down from docs alone — defensively
// accept a few plausible wrappings around the project list.
function extractProjectNames(payload: unknown): string[]
{
    const list: unknown = Array.isArray(payload)
        ? payload
        : (payload as { projects?: unknown; data?: unknown })?.projects ??
          (payload as { data?: unknown })?.data ??
          [];

    if (!Array.isArray(list))
    {
        return [];
    }

    return list
        .map((entry) =>
        {
            if (typeof entry === "string")
            {
                return entry;
            }
            const obj = entry as { name?: string; project?: string };
            return obj?.name ?? obj?.project ?? "";
        })
        .filter((name): name is string => Boolean(name));
}

// Same rule as the login route — only ever redirect same-site.
function sanitizeReturnTo(value: string | undefined): string
{
    if (!value || !value.startsWith("/") || value.startsWith("//"))
    {
        return "/projects";
    }

    return value;
}

export async function GET(request: NextRequest)
{
    const code = request.nextUrl.searchParams.get("code");
    const returnedState = request.nextUrl.searchParams.get("state");
    const expectedState = request.cookies.get("hackatime_oauth_state")?.value;
    const returnTo = sanitizeReturnTo(request.cookies.get("hackatime_return_to")?.value);

    if (!code || !returnedState || returnedState !== expectedState)
    {
        return NextResponse.redirect(new URL("/projects?hackatimeError=1", request.url));
    }

    const tokenRes = await fetch("https://hackatime.hackclub.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: process.env.HACKATIME_CLIENT_ID,
            client_secret: process.env.HACKATIME_CLIENT_SECRET,
            redirect_uri: process.env.HACKATIME_REDIRECT_URI,
            code,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token)
    {
        return NextResponse.redirect(new URL("/projects?hackatimeError=1", request.url));
    }

    const projectsRes = await fetch(
        "https://hackatime.hackclub.com/api/v1/authenticated/projects",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const names = projectsRes.ok ? extractProjectNames(await projectsRes.json()) : [];

    // Best-effort — a hiccup persisting this shouldn't strand the user on
    // an error page when the OAuth handshake itself already succeeded.
    try
    {
        const user = await getSessionUser();
        if (user?.email)
        {
            await setHackatimeConnected(user.email);
            await setHackatimeProjects(user.email, names);
        }
    }
    catch (err)
    {
        console.error("Failed to record Hackatime connection:", err);
    }

    const response = NextResponse.redirect(new URL(returnTo, request.url));
    response.cookies.delete("hackatime_oauth_state");
    response.cookies.delete("hackatime_return_to");

    return response;
}
