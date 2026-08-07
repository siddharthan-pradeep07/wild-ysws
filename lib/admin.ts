import { getUserRole } from "@/lib/users";

// Env allowlist — invisible bootstrap admins, never stored anywhere a user
// can see or edit. Kept even now that roles exist so there's always a way
// in that doesn't depend on Airtable being configured or reachable.
export function isAdminUser(email: string | undefined | null): boolean
{
    if (!email)
    {
        return false;
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

    return adminEmails.includes(email.toLowerCase());
}

// Combined admin check: env-listed emails are always admins (fast, sync,
// no Airtable dependency); everyone else's access follows the Role field
// on their Users record, which is what the admin panel's role dropdown
// edits.
export async function isAdmin(email: string | undefined | null): Promise<boolean>
{
    if (isAdminUser(email))
    {
        return true;
    }

    const role = await getUserRole(email);
    return role === "admin";
}
