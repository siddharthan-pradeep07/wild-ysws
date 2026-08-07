// Minimal Airtable REST API client — no SDK dependency, just fetch, matching
// how the rest of this app talks to the Hack Club OAuth API.
// Docs: https://airtable.com/developers/web/api/introduction

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

function getConfig()
{
    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!token || !baseId)
    {
        throw new Error(
            "Airtable is not configured. Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID in .env.local"
        );
    }

    return { token, baseId };
}

function recordUrl(table: string, id?: string)
{
    const { baseId } = getConfig();
    const base = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}`;
    return id ? `${base}/${id}` : base;
}

async function airtableFetch(url: string, init?: RequestInit)
{
    const { token } = getConfig();

    const res = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        // Always hit Airtable directly — this is admin data, not something
        // we want Next.js caching stale copies of.
        cache: "no-store",
    });

    if (!res.ok)
    {
        const body = await res.text();
        throw new Error(`Airtable request failed (${res.status}): ${body}`);
    }

    return res.json();
}

export type AirtableRecord<T> =
{
    id: string;
    createdTime: string;
    fields: T;
};

export async function listRecords<T>(
    table: string,
    params?: Record<string, string>
): Promise<AirtableRecord<T>[]>
{
    const records: AirtableRecord<T>[] = [];
    let offset: string | undefined;

    do
    {
        const query = new URLSearchParams(params ?? {});
        if (offset)
        {
            query.set("offset", offset);
        }

        const qs = query.toString();
        const url = qs ? `${recordUrl(table)}?${qs}` : recordUrl(table);

        const data = await airtableFetch(url);
        records.push(...data.records);
        offset = data.offset;
    }
    while (offset);

    return records;
}

export async function createRecord<T extends object>(
    table: string,
    fields: T
): Promise<AirtableRecord<T>>
{
    return airtableFetch(recordUrl(table), {
        method: "POST",
        body: JSON.stringify({ fields }),
    });
}

export async function updateRecord<T extends object>(
    table: string,
    id: string,
    fields: Partial<T>
): Promise<AirtableRecord<T>>
{
    return airtableFetch(recordUrl(table, id), {
        method: "PATCH",
        body: JSON.stringify({ fields }),
    });
}

export async function deleteRecord(table: string, id: string): Promise<void>
{
    await airtableFetch(recordUrl(table, id), { method: "DELETE" });
}
