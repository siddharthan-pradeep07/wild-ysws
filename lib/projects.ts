import {
    AirtableAttachment,
    AirtableRecord,
    createRecord,
    deleteRecord,
    listRecords,
    updateRecord,
    uploadAttachment,
} from "@/lib/airtable";

// This lives in the same Airtable base as shop items and users, in its own
// table. The PROJECT_TYPES list below has to match the Project Type single
// select options in Airtable exactly.
const TABLE = process.env.AIRTABLE_PROJECTS_TABLE_NAME ?? "Projects";

export const DEFAULT_PROJECT_IMAGE_URL = "https://cdn.hackclub.com/019ff685-303d-79c0-889b-58bdd041d614/wild_image_not_found.png";

export const PROJECT_TYPES = [
    "Web Playable",
    "Windows Playable",
    "Mac Playable",
    "Linux Playable",
    "Cross Platform",
    "Python",
    "Android Playable",
    "iOS playable",
    "Hardware",
    "Other / Not sure",
] as const;

export type Project =
{
    id: string;
    name: string;
    description: string;
    codeUrl: string;
    demoUrl: string;
    readmeUrl: string;
    screenshotUrl: string;
    aiUsage: string;
    projectType: string;
    hackatimeProject: string;
    ownerEmail: string;
    ownerName: string;
    createdAt: string;
};

type ProjectFields =
{
    Name: string;
    Description?: string;
    "Code URL"?: string;
    "Demo URL"?: string;
    "Readme URL"?: string;
    Screenshot?: AirtableAttachment[];
    "AI Usage"?: string;
    "Project Type"?: string;
    "Hackatime Project"?: string;
    "Owner Email"?: string;
    "Owner Name"?: string;
};

function recordToProject(record: AirtableRecord<ProjectFields>): Project
{
    return {
        id: record.id,
        name: record.fields.Name ?? "",
        description: record.fields.Description ?? "",
        codeUrl: record.fields["Code URL"] ?? "",
        demoUrl: record.fields["Demo URL"] ?? "",
        readmeUrl: record.fields["Readme URL"] ?? "",
        // Airtable attachment URLs are signed and expire after a few hours,
        // so this should always be read fresh from a live record and never
        // cached or stored.
        screenshotUrl: record.fields.Screenshot?.[0]?.url ?? "",
        aiUsage: record.fields["AI Usage"] ?? "",
        projectType: record.fields["Project Type"] ?? "",
        hackatimeProject: record.fields["Hackatime Project"] ?? "",
        ownerEmail: record.fields["Owner Email"] ?? "",
        ownerName: record.fields["Owner Name"] ?? "",
        createdAt: record.createdTime,
    };
}

export type ProjectInput =
{
    name: string;
    description: string;
    codeUrl: string;
    demoUrl: string;
    readmeUrl: string;
    aiUsage: string;
    projectType: string;
    hackatimeProject: string;
};

function inputToFields(
    data: ProjectInput
): Omit<ProjectFields, "Owner Email" | "Owner Name" | "Screenshot">
{
    return {
        Name: data.name,
        Description: data.description,
        "Code URL": data.codeUrl,
        "Demo URL": data.demoUrl,
        "Readme URL": data.readmeUrl,
        "AI Usage": data.aiUsage,
        // Airtable rejects an empty string for a single select field, since
        // it would have to create a blank option and the token isn't
        // allowed to do that. Leaving the key out entirely, since
        // JSON.stringify drops undefined values, just leaves the field
        // unset instead.
        "Project Type": data.projectType || undefined,
        "Hackatime Project": data.hackatimeProject,
    };
}

export async function listProjects(): Promise<Project[]>
{
    try
    {
        const records = await listRecords<ProjectFields>(TABLE);

        return records
            .map(recordToProject)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    catch (err)
    {
        console.error("Failed to list projects:", err);
        return [];
    }
}

function escapeFormulaValue(value: string): string
{
    return value.replace(/'/g, "\\'");
}

// The /projects page only ever shows a user their own projects, not a
// shared gallery. This filters server side with an Airtable formula
// rather than fetching everything and slicing it down on the client.
export async function listProjectsByOwner(email: string): Promise<Project[]>
{
    try
    {
        const records = await listRecords<ProjectFields>(TABLE, {
            filterByFormula: `LOWER({Owner Email}) = '${escapeFormulaValue(email.toLowerCase())}'`,
        });

        return records
            .map(recordToProject)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    catch (err)
    {
        console.error("Failed to list projects for owner:", err);
        return [];
    }
}

export async function getProject(id: string): Promise<Project | undefined>
{
    const records = await listRecords<ProjectFields>(TABLE, {
        filterByFormula: `RECORD_ID() = '${id}'`,
        maxRecords: "1",
    });

    return records[0] ? recordToProject(records[0]) : undefined;
}

async function attachScreenshot(id: string, screenshot: File): Promise<void>
{
    const base64 = Buffer.from(await screenshot.arrayBuffer()).toString("base64");

    await uploadAttachment(TABLE, id, "Screenshot", {
        base64,
        contentType: screenshot.type || "application/octet-stream",
        filename: screenshot.name || "screenshot",
    });
}

export async function createProject(
    owner: { email: string; name: string },
    data: ProjectInput,
    screenshot?: File | null
): Promise<Project>
{
    const record = await createRecord<ProjectFields>(TABLE, {
        ...inputToFields(data),
        "Owner Email": owner.email,
        "Owner Name": owner.name,
    });

    if (!screenshot || screenshot.size === 0)
    {
        return recordToProject(record);
    }

    await attachScreenshot(record.id, screenshot);

    // Fetches the record again to get the attachment's Airtable hosted URL.
    return (await getProject(record.id)) ?? recordToProject(record);
}

export async function updateProject(
    id: string,
    data: ProjectInput,
    screenshot?: File | null
): Promise<Project>
{
    const record = await updateRecord<ProjectFields>(TABLE, id, inputToFields(data));

    if (!screenshot || screenshot.size === 0)
    {
        return recordToProject(record);
    }

    // uploadAttachment appends rather than replaces, so the field gets
    // cleared first, otherwise a new screenshot would just pile up next to
    // the old one instead of replacing it.
    await updateRecord<ProjectFields>(TABLE, id, { Screenshot: [] });
    await attachScreenshot(id, screenshot);

    return (await getProject(id)) ?? recordToProject(record);
}

export async function deleteProject(id: string): Promise<void>
{
    await deleteRecord(TABLE, id);
}
