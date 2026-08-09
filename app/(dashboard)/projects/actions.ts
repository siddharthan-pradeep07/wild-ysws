"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { getUserRole } from "@/lib/users";
import {
    createProject,
    deleteProject,
    getProject,
    updateProject,
} from "@/lib/projects";

// The banned check on the /projects page only stops a banned user from
// seeing the UI — Server Actions are reachable via direct POST regardless
// of what's rendered, so it has to be re-checked here too or a banned user
// could keep creating/editing/deleting projects through a raw request.
async function requireUser()
{
    const user = await getSessionUser();

    if (!user?.email)
    {
        redirect("/");
    }

    const role = await getUserRole(user.email);

    if (role === "banned")
    {
        redirect("/projects");
    }

    return user;
}

function parseProjectInput(formData: FormData)
{
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const codeUrl = String(formData.get("codeUrl") ?? "").trim();
    const demoUrl = String(formData.get("demoUrl") ?? "").trim();
    const readmeUrl = String(formData.get("readmeUrl") ?? "").trim();
    const aiUsage = String(formData.get("aiUsage") ?? "").trim();
    const projectType = String(formData.get("projectType") ?? "").trim();
    const hackatimeProject = String(formData.get("hackatimeProject") ?? "").trim();

    if (!name)
    {
        throw new Error("Project name is required");
    }

    const screenshotEntry = formData.get("screenshot");
    const screenshot =
        screenshotEntry instanceof File && screenshotEntry.size > 0
            ? screenshotEntry
            : null;

    return {
        data: {
            name,
            description,
            codeUrl,
            demoUrl,
            readmeUrl,
            aiUsage,
            projectType,
            hackatimeProject,
        },
        screenshot,
    };
}

function parseId(formData: FormData): string
{
    const id = String(formData.get("id") ?? "").trim();

    if (!id)
    {
        throw new Error("Invalid project id");
    }

    return id;
}

// Reachable via direct POST regardless of whether the Edit/Delete buttons
// are even rendered client-side — so ownership is re-checked here, not
// just used to decide what the UI shows.
async function requireOwnerOrAdmin(projectId: string, userEmail: string)
{
    const project = await getProject(projectId);

    if (!project)
    {
        throw new Error("Project not found");
    }

    if (project.ownerEmail.toLowerCase() === userEmail.toLowerCase())
    {
        return;
    }

    if (await isAdmin(userEmail))
    {
        return;
    }

    redirect("/projects");
}

export async function createProjectAction(formData: FormData)
{
    const user = await requireUser();
    const { data, screenshot } = parseProjectInput(formData);

    await createProject({ email: user.email!, name: user.name ?? "" }, data, screenshot);

    revalidatePath("/projects");
}

export async function updateProjectAction(formData: FormData)
{
    const user = await requireUser();
    const id = parseId(formData);

    await requireOwnerOrAdmin(id, user.email!);

    const { data, screenshot } = parseProjectInput(formData);
    await updateProject(id, data, screenshot);

    revalidatePath("/projects");
}

export async function deleteProjectAction(formData: FormData)
{
    const user = await requireUser();
    const id = parseId(formData);

    await requireOwnerOrAdmin(id, user.email!);

    await deleteProject(id);

    revalidatePath("/projects");
}
