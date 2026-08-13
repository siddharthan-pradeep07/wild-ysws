// This is a minimal Airtable REST API client with no SDK dependency, just
// plain fetch calls, matching how the rest of this app talks to the Hack
// Club OAuth API. Docs: https://airtable.com/developers/web/api/introduction

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
// Attachment uploads go through a different host than every other Airtable
// API call. See https://airtable.com/developers/web/api/upload-attachment
const AIRTABLE_CONTENT_URL = "https://content.airtable.com/v0";

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
        // This always hits Airtable directly, since this is admin data and
        // not something we want Next.js caching stale copies of.
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

export type AirtableAttachment =
{
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
};

// Uploads file bytes directly as base64 instead of making Airtable fetch a
// public URL. This is the only option for attaching a file that only
// exists as an in-memory upload from a browser file input and isn't
// hosted anywhere public. The record has to already exist, since this
// attaches to one of its existing Attachment fields.
export async function uploadAttachment(
    table: string,
    recordId: string,
    fieldName: string,
    file: { base64: string; contentType: string; filename: string }
): Promise<AirtableRecord<Record<string, AirtableAttachment[]>>>
{
    const { token, baseId } = getConfig();

    const res = await fetch(
        `${AIRTABLE_CONTENT_URL}/${baseId}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contentType: file.contentType,
                file: file.base64,
                filename: file.filename,
            }),
        }
    );

    if (!res.ok)
    {
        const body = await res.text();
        throw new Error(`Airtable attachment upload failed (${res.status}): ${body}`);
    }

    return res.json();
}
