import { cache } from "react";
import {
    AirtableRecord,
    createRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

// Same base as shop items, separate table. Columns: Name, Email, Slack ID
// (single line text) and Role (single select: "user", "admin", "banned").
const TABLE = process.env.AIRTABLE_USERS_TABLE_NAME ?? "Users";

export type UserRole = "user" | "admin" | "banned";

export type AppUser =
{
    id: string;
    name: string;
    email: string;
    slackId: string;
    role: UserRole;
    hackatimeConnected: boolean;
    hackatimeConnectedAt: string;
    createdAt: string;
    userId: string;
    yswsEligible: boolean;
    verificationStatus: string;
    lastLogin: string;
    loginCount: number;
    internalNote: string;
};

type UserFields =
{
    Name?: string;
    Email?: string;
    "Slack ID"?: string;
    Role?: string;
    "Hackatime Connected"?: boolean;
    // JSON-encoded string[] of Hackatime project names — a snapshot from
    // the last time they connected/refreshed, not a live token. We never
    // store the actual Hackatime access token anywhere.
    "Hackatime Projects"?: string;
    "Hackatime Connected At"?: string;
    // Hack Club's stable subject identifier (OAuth `sub`) — not the same as
    // the Airtable record id, this is the identity Hack Club itself uses.
    "User ID"?: string;
    "YSWS Eligible"?: boolean;
    "Verification Status"?: string;
    "Last Login"?: string;
    "Login Count"?: number;
    // Admin-only — never shown to the user it's about.
    "Internal Note"?: string;
};

function normalizeRole(role: string | undefined): UserRole
{
    if (role === "admin" || role === "banned")
    {
        return role;
    }
    return "user";
}

function recordToUser(record: AirtableRecord<UserFields>): AppUser
{
    return {
        id: record.id,
        name: record.fields.Name ?? "",
        email: record.fields.Email ?? "",
        slackId: record.fields["Slack ID"] ?? "",
        role: normalizeRole(record.fields.Role),
        hackatimeConnected: record.fields["Hackatime Connected"] === true,
        hackatimeConnectedAt: record.fields["Hackatime Connected At"] ?? "",
        createdAt: record.createdTime,
        userId: record.fields["User ID"] ?? "",
        yswsEligible: record.fields["YSWS Eligible"] === true,
        verificationStatus: record.fields["Verification Status"] ?? "",
        lastLogin: record.fields["Last Login"] ?? "",
        loginCount: record.fields["Login Count"] ?? 0,
        internalNote: record.fields["Internal Note"] ?? "",
    };
}

export async function listUsers(): Promise<AppUser[]>
{
    try
    {
        const records = await listRecords<UserFields>(TABLE);

        return records
            .map(recordToUser)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    catch (err)
    {
        // Don't take down the whole admin page over the Users tab — e.g.
        // the Users table hasn't been created in Airtable yet.
        console.error("Failed to list users:", err);
        return [];
    }
}

function escapeFormulaValue(value: string): string
{
    return value.replace(/'/g, "\\'");
}

// getUserRole/isHackatimeConnected/getHackatimeProjects are all called
// independently — from the dashboard layout, the page itself, and often
// more than once per request — and until now each one re-fetched this same
// row from Airtable. cache() memoizes per-request (same email in, same
// promise out), so a single page load costs at most one lookup instead of
// three or four sequential ones.
const findUserRecordByEmail = cache(
    async (email: string): Promise<AirtableRecord<UserFields> | undefined> =>
    {
        const records = await listRecords<UserFields>(TABLE, {
            filterByFormula: `{Email} = '${escapeFormulaValue(email)}'`,
            maxRecords: "1",
        });

        return records[0];
    }
);

// Used for authorization on every dashboard page load. Callers should check
// the env admin allowlist (lib/admin.ts) first — that's a free sync check;
// this one costs an Airtable round trip and fails closed (non-admin) on
// any error, so a misconfigured/missing Users table never grants access.
export async function getUserRole(email: string | undefined | null): Promise<UserRole>
{
    if (!email)
    {
        return "user";
    }

    try
    {
        const record = await findUserRecordByEmail(email);
        return normalizeRole(record?.fields.Role);
    }
    catch (err)
    {
        console.error("Failed to look up user role:", err);
        return "user";
    }
}

export async function updateUserRole(id: string, role: UserRole): Promise<void>
{
    await updateRecord<UserFields>(TABLE, id, { Role: role });
}

// Gates /projects and drives the prompt on /home. Fails closed (not
// connected) on any error, same reasoning as getUserRole.
export async function isHackatimeConnected(
    email: string | undefined | null
): Promise<boolean>
{
    if (!email)
    {
        return false;
    }

    try
    {
        const record = await findUserRecordByEmail(email);
        return record?.fields["Hackatime Connected"] === true;
    }
    catch (err)
    {
        console.error("Failed to check Hackatime connection:", err);
        return false;
    }
}

export async function setHackatimeConnected(email: string): Promise<void>
{
    const record = await findUserRecordByEmail(email);

    if (!record)
    {
        return;
    }

    await updateRecord<UserFields>(TABLE, record.id, {
        "Hackatime Connected": true,
        "Hackatime Connected At": new Date().toISOString(),
    });
}

// Admin-only field, edited from the Users tab's expanded row detail — never
// exposed anywhere the user it's about could see it.
export async function updateInternalNote(id: string, note: string): Promise<void>
{
    await updateRecord<UserFields>(TABLE, id, { "Internal Note": note });
}

export type HackatimeProjectStat =
{
    name: string;
    hours: number;
};

// Snapshot of a user's Hackatime projects (with tracked hours), refreshed
// each time they go through the OAuth connect/refresh flow. Lets the
// compose form and project cards render immediately on every page load
// instead of only right after an OAuth redirect — the tradeoff is it can
// go stale until they refresh.
export async function getHackatimeProjects(
    email: string | undefined | null
): Promise<HackatimeProjectStat[]>
{
    if (!email)
    {
        return [];
    }

    try
    {
        const record = await findUserRecordByEmail(email);
        const raw = record?.fields["Hackatime Projects"];

        if (!raw)
        {
            return [];
        }

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed))
        {
            return [];
        }

        return parsed
            .map((entry): HackatimeProjectStat | null =>
            {
                // Back-compat with the older string[]-only snapshot format.
                if (typeof entry === "string")
                {
                    return { name: entry, hours: 0 };
                }
                if (entry && typeof entry.name === "string")
                {
                    return {
                        name: entry.name,
                        hours: typeof entry.hours === "number" ? entry.hours : 0,
                    };
                }
                return null;
            })
            .filter((v): v is HackatimeProjectStat => v !== null);
    }
    catch (err)
    {
        console.error("Failed to read Hackatime projects:", err);
        return [];
    }
}

export async function setHackatimeProjects(
    email: string,
    projects: HackatimeProjectStat[]
): Promise<void>
{
    const record = await findUserRecordByEmail(email);

    if (!record)
    {
        return;
    }

    await updateRecord<UserFields>(TABLE, record.id, {
        "Hackatime Projects": JSON.stringify(projects),
    });
}

export type LoginInfo =
{
    name: string;
    email: string;
    slackId: string;
    // From Hack Club's OAuth userinfo response — sub is their stable user
    // id, the other two can change between logins (e.g. re-verification),
    // so unlike Role these are refreshed on every login, not just creation.
    sub?: string;
    verificationStatus?: string;
    yswsEligible?: boolean;
};

// Called from the OAuth callback on every login. Upserts by email so
// returning users update their record instead of piling up duplicates.
// Role is only ever set when the record is first created — never
// overwritten on later logins, so a role granted from the admin panel
// sticks instead of resetting back to "user" the next time they sign in.
export async function recordUserLogin(data: LoginInfo): Promise<void>
{
    if (!data.email)
    {
        return;
    }

    const existing = await findUserRecordByEmail(data.email);
    const now = new Date().toISOString();

    if (existing)
    {
        await updateRecord<UserFields>(TABLE, existing.id, {
            Name: data.name,
            "Slack ID": data.slackId,
            "User ID": data.sub,
            "Verification Status": data.verificationStatus,
            "YSWS Eligible": data.yswsEligible === true,
            "Last Login": now,
            "Login Count": (existing.fields["Login Count"] ?? 0) + 1,
        });
    }
    else
    {
        await createRecord<UserFields>(TABLE, {
            Name: data.name,
            Email: data.email,
            "Slack ID": data.slackId,
            Role: "user",
            "User ID": data.sub,
            "Verification Status": data.verificationStatus,
            "YSWS Eligible": data.yswsEligible === true,
            "Last Login": now,
            "Login Count": 1,
        });
    }
}
