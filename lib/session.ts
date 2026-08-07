import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/sessionCookie";

export type SessionUser =
{
    email?: string;
    name?: string;
    slack_id?: string;
    verification_status?: string;
    ysws_eligible?: boolean;
    sub?: string;
};

export async function getSessionUser(): Promise<SessionUser | null>
{
    const cookieStore = await cookies();
    const raw = cookieStore.get("session_user")?.value;

    return verifySessionCookie<SessionUser>(raw);
}
