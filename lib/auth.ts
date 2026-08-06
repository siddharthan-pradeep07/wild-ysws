import { cookies } from "next/headers";

export async function getCurrentUser()
{
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) 
    {
        return null;
    }

    const res = await fetch("https://auth.hackclub.com/oauth/userinfo",
    {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok)
    {
        return null;
    }
    return res.json();
}    