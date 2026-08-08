import {
    AirtableRecord,
    createRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

// Same base as shop items, separate table. Columns: Name, Email, Slack ID
// (single line text) and Role (single select: "user", "admin").
const TABLE = process.env.AIRTABLE_USERS_TABLE_NAME ?? "Users";

export type UserRole = "user" | "admin";

export type AppUser =
{
    id: string;
    name: string;
    email: string;
    slackId: string;
    role: UserRole;
    createdAt: string;
};

type UserFields =
{
    Name?: string;
    Email?: string;
    "Slack ID"?: string;
    Role?: string;
    "Hackatime Connected"?: boolean;
};

function normalizeRole(role: string | undefined): UserRole
{
    return role === "admin" ? "admin" : "user";
}

function recordToUser(record: AirtableRecord<UserFields>): AppUser
{
    return {
        id: record.id,
        name: record.fields.Name ?? "",
        email: record.fields.Email ?? "",
        slackId: record.fields["Slack ID"] ?? "",
        role: normalizeRole(record.fields.Role),
        createdAt: record.createdTime,
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

async function findUserRecordByEmail(
    email: string
): Promise<AirtableRecord<UserFields> | undefined>
{
    const records = await listRecords<UserFields>(TABLE, {
        filterByFormula: `{Email} = '${escapeFormulaValue(email)}'`,
        maxRecords: "1",
    });

    return records[0];
}

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

    await updateRecord<UserFields>(TABLE, record.id, { "Hackatime Connected": true });
}

export type LoginInfo =
{
    name: string;
    email: string;
    slackId: string;
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

    if (existing)
    {
        await updateRecord<UserFields>(TABLE, existing.id, {
            Name: data.name,
            "Slack ID": data.slackId,
        });
    }
    else
    {
        await createRecord<UserFields>(TABLE, {
            Name: data.name,
            Email: data.email,
            "Slack ID": data.slackId,
            Role: "user",
        });
    }
}
