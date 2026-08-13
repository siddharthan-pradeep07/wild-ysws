import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { setHackatimeConnected, setHackatimeProjects, type HackatimeProjectStat } from "@/lib/users";

type HackatimeProjectEntry =
{
    name?: string;
    project?: string;
    hours?: number;
    total_seconds?: number;
    seconds?: number;
    total_time?: number;
    grand_total?: { hours?: number; minutes?: number };
};

// The response shape isn't fully pinned down from the docs alone, so this
// defensively accepts a few plausible wrappings around the project list
// and a few plausible shapes for the tracked time value. Hackatime is
// WakaTime API compatible, so these mirror that family of APIs' common
// field names.
function extractProjectStats(payload: unknown): HackatimeProjectStat[]
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
        .map((raw): HackatimeProjectStat | null =>
        {
            if (typeof raw === "string")
            {
                return { name: raw, hours: 0 };
            }

            const entry = raw as HackatimeProjectEntry;
            const name = entry?.name ?? entry?.project ?? "";

            if (!name)
            {
                return null;
            }

            let hours = 0;

            if (typeof entry.hours === "number")
            {
                hours = entry.hours;
            }
            else if (typeof entry.total_seconds === "number")
            {
                hours = entry.total_seconds / 3600;
            }
            else if (typeof entry.seconds === "number")
            {
                hours = entry.seconds / 3600;
            }
            else if (typeof entry.total_time === "number")
            {
                hours = entry.total_time / 3600;
            }
            else if (entry.grand_total && typeof entry.grand_total.hours === "number")
            {
                hours = entry.grand_total.hours + (entry.grand_total.minutes ?? 0) / 60;
            }

            return { name, hours: Math.round(hours * 10) / 10 };
        })
        .filter((v): v is HackatimeProjectStat => v !== null);
}

// Same rule as the login route, this only ever redirects to a same site path.
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

    const stats = projectsRes.ok ? extractProjectStats(await projectsRes.json()) : [];

    // This is best effort. A hiccup saving this data shouldn't strand the
    // user on an error page when the OAuth handshake itself already succeeded.
    try
    {
        const user = await getSessionUser();
        if (user?.email)
        {
            await setHackatimeConnected(user.email);
            await setHackatimeProjects(user.email, stats);
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
