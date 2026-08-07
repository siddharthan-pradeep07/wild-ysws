import {
    AirtableRecord,
    createRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

// Separate table from shop items, in the same Airtable base. Create it with
// exactly these three single line text columns: Name, Email, Slack ID.
const TABLE = process.env.AIRTABLE_USERS_TABLE_NAME ?? "Users";

export type AppUser =
{
    id: string;
    name: string;
    email: string;
    slackId: string;
    createdAt: string;
};

type UserFields =
{
    Name?: string;
    Email?: string;
    "Slack ID"?: string;
};

function recordToUser(record: AirtableRecord<UserFields>): AppUser
{
    return {
        id: record.id,
        name: record.fields.Name ?? "",
        email: record.fields.Email ?? "",
        slackId: record.fields["Slack ID"] ?? "",
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

export type LoginInfo =
{
    name: string;
    email: string;
    slackId: string;
};

// Called from the OAuth callback on every login. Upserts by email so
// returning users update their record instead of piling up duplicates.
export async function recordUserLogin(data: LoginInfo): Promise<void>
{
    if (!data.email)
    {
        return;
    }

    const fields: UserFields = {
        Name: data.name,
        Email: data.email,
        "Slack ID": data.slackId,
    };

    const existing = await listRecords<UserFields>(TABLE, {
        filterByFormula: `{Email} = '${escapeFormulaValue(data.email)}'`,
        maxRecords: "1",
    });

    if (existing[0])
    {
        await updateRecord<UserFields>(TABLE, existing[0].id, fields);
    }
    else
    {
        await createRecord<UserFields>(TABLE, fields);
    }
}
