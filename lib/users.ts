import { cache } from "react";
import {
    AirtableRecord,
    createRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

// This table lives in the same Airtable base as shop items. It has Name,
// Email and Slack ID as single line text columns, plus a Role single
// select field with the options user, admin and banned.
const TABLE = process.env.AIRTABLE_USERS_TABLE_NAME ?? "Users";

export type UserRole = "user" | "admin" | "banned" | "reviewer";

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
    barks: number;
};

type UserFields =
{
    Name?: string;
    Email?: string;
    "Slack ID"?: string;
    Role?: string;
    "Hackatime Connected"?: boolean;
    // Holds a JSON encoded list of Hackatime project names. It's just a
    // snapshot from the last time the user connected or refreshed, not a
    // live token, since we never store their actual Hackatime access token.
    "Hackatime Projects"?: string;
    "Hackatime Connected At"?: string;
    // Hack Club's own stable identifier for the user, the OAuth sub value.
    // It's different from the Airtable record id, this is the identity
    // Hack Club itself uses.
    "User ID"?: string;
    "YSWS Eligible"?: boolean;
    "Verification Status"?: string;
    "Last Login"?: string;
    "Login Count"?: number;
    // Only admins can see this field, it's never shown to the user it's about.
    "Internal Note"?: string;
    "Featured Items"?: string;
    barks?: number;
};

function normalizeRole(role: string | undefined): UserRole
{
    if (role === "admin" || role === "banned" || role === "reviewer")
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
        barks: record.fields.barks ?? 0,
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
        // A failure here shouldn't take down the whole admin page just because
        // of the Users tab, for example if the Users table hasn't been
        // created in Airtable yet.
        console.error("Failed to list users:", err);
        return [];
    }
}

function escapeFormulaValue(value: string): string
{
    return value.replace(/'/g, "\\'");
}

// getUserRole, isHackatimeConnected and getHackatimeProjects are all called
// independently, from the dashboard layout, the page itself, and often more
// than once per request. Each one used to re-fetch this same row from
// Airtable on its own. cache() memoizes the lookup per request, so a single
// page load now costs at most one Airtable call instead of three or four.
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

// This runs on every dashboard page load to check authorization. Callers
// should check the env admin allowlist in lib/admin.ts first, since that's
// a free, synchronous check. This one costs an Airtable round trip and
// fails closed to non-admin on any error, so a misconfigured or missing
// Users table can never accidentally grant access.
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

export async function isReviewer(email: string | undefined | null): Promise<boolean>
{
    const role = await getUserRole(email);
    return role === "reviewer";
}

export async function getBarks(email: string | undefined | null): Promise<number>
{
    if (!email)
    {
        return 0;
    }

    try
    {
        const record = await findUserRecordByEmail(email);
        return record?.fields.barks ?? 0;
    }
    catch (err)
    {
        console.error("Failed to look up bark balance:", err);
        return 0;
    }
}

// Grants (positive delta) or revokes (negative delta) barks for a user, by
// Airtable record id. Reads the current balance fresh right before writing,
// rather than trusting a balance the admin panel already had on screen, so
// two admins adjusting the same user around the same time don't clobber
// each other. Never lets the balance go below zero.
export async function adjustBarks(id: string, delta: number): Promise<number>
{
    const records = await listRecords<UserFields>(TABLE, {
        filterByFormula: `RECORD_ID() = '${id}'`,
        maxRecords: "1",
    });

    const current = records[0]?.fields.barks ?? 0;
    const next = Math.max(0, current + delta);

    await updateRecord<UserFields>(TABLE, id, { barks: next });
    return next;
}

export async function updateUserRole(id: string, role: UserRole): Promise<void>
{
    await updateRecord<UserFields>(TABLE, id, { Role: role });
}

// Gates access to /projects and drives the connect prompt on /home. Fails
// closed to not connected on any error, for the same reason as getUserRole.
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

// Admin-only field, edited from the Users tab's expanded row detail. It's
// never exposed anywhere the user it's about could see it.
export async function updateInternalNote(id: string, note: string): Promise<void>
{
    await updateRecord<UserFields>(TABLE, id, { "Internal Note": note });
}

function parseFeaturedItems(raw: string | undefined): string[]
{
    if (!raw)
    {
        return [];
    }

    try
    {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    }
    catch
    {
        return [];
    }
}

export async function getFeaturedItemIds(email: string | undefined | null): Promise<string[]>
{
    if (!email)
    {
        return [];
    }

    try
    {
        const record = await findUserRecordByEmail(email);
        return parseFeaturedItems(record?.fields["Featured Items"]);
    }
    catch (err)
    {
        console.error("Failed to read featured items:", err);
        return [];
    }
}

export async function toggleFeaturedItem(email: string, itemId: string): Promise<string[]>
{
    const record = await findUserRecordByEmail(email);

    if (!record)
    {
        return [];
    }

    const current = parseFeaturedItems(record.fields["Featured Items"]);

    let next: string[];

    if (current.includes(itemId))
    {
        next = current.filter((id) => id !== itemId);
    }
    else if (current.length >= 3)
    {
        return current;
    }
    else
    {
        next = [...current, itemId];
    }

    await updateRecord<UserFields>(TABLE, record.id, { "Featured Items": JSON.stringify(next) });
    return next;
}

export type HackatimeProjectStat =
{
    name: string;
    hours: number;
};

// A snapshot of a user's Hackatime projects and tracked hours, refreshed
// each time they go through the OAuth connect or refresh flow. This lets
// the compose form and project cards render immediately on every page
// load instead of only right after an OAuth redirect. The tradeoff is that
// it can go stale until the user refreshes again.
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
                // Kept for backwards compatibility with the older format,
                // which was just a plain array of strings.
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
    // These come from Hack Club's OAuth userinfo response. sub is their
    // stable user id, while the other two can change between logins, for
    // example after re-verification. Unlike Role, they get refreshed on
    // every login instead of only when the record is first created.
    sub?: string;
    verificationStatus?: string;
    yswsEligible?: boolean;
};

// Called from the OAuth callback on every login. It upserts by email so
// returning users update their existing record instead of piling up
// duplicates. Role only gets set when the record is first created and is
// never overwritten on later logins, so a role granted from the admin
// panel sticks instead of resetting back to user the next time someone
// signs in.
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
