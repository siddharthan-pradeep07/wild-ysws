import { getUserRole } from "@/lib/users";

// This is an env based allowlist for bootstrap admins. It's invisible,
// never stored anywhere a user can see or edit, and it's kept around even
// now that roles exist so there's always a way in that doesn't depend on
// Airtable being configured or reachable.
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

// This is the combined admin check. Emails listed in the env var are
// always admins, which is a fast, synchronous check with no Airtable
// dependency. Everyone else's access follows the Role field on their
// Users record, the same field the admin panel's role dropdown edits.
export async function isAdmin(email: string | undefined | null): Promise<boolean>
{
    if (isAdminUser(email))
    {
        return true;
    }

    const role = await getUserRole(email);
    return role === "admin";
}
