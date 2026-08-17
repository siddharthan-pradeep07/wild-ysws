"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import {
    createShopItem,
    deleteShopItem,
    reorderShopItems,
    updateShopItem,
} from "@/lib/shop";
import { updateInternalNote, updateUserRole, type UserRole } from "@/lib/users";

// Every action here re-checks admin status on the server, since Server
// Actions can be reached with a direct POST request and not just through
// the admin page's UI.
async function requireAdmin()
{
    const user = await getSessionUser();

    if (!(await isAdmin(user?.email)))
    {
        redirect("/home");
    }
}

function parseItemInput(formData: FormData)
{
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const fulfillment = String(formData.get("fulfillment") ?? "").trim();
    const price = Number(formData.get("price"));
    const disabled = formData.get("disabled") === "on";

    if (!name)
    {
        throw new Error("Item name is required");
    }
    if (!Number.isFinite(price) || price < 0)
    {
        throw new Error("Price must be a positive number");
    }

    return { name, description, imageUrl, fulfillment, price, disabled };
}

function parseId(formData: FormData): string
{
    const id = String(formData.get("id") ?? "").trim();

    if (!id)
    {
        throw new Error("Invalid item id");
    }

    return id;
}

export async function createShopItemAction(formData: FormData)
{
    await requireAdmin();

    const data = parseItemInput(formData);
    await createShopItem(data);

    revalidatePath("/admin");
    revalidatePath("/shop");
}

export async function updateShopItemAction(formData: FormData)
{
    await requireAdmin();

    const id = parseId(formData);
    const data = parseItemInput(formData);
    await updateShopItem(id, data);

    revalidatePath("/admin");
    revalidatePath("/shop");
}

export async function deleteShopItemAction(formData: FormData)
{
    await requireAdmin();

    const id = parseId(formData);
    await deleteShopItem(id);

    revalidatePath("/admin");
    revalidatePath("/shop");
}

export async function reorderShopItemsAction(formData: FormData)
{
    await requireAdmin();

    const raw = String(formData.get("ids") ?? "");
    let ids: unknown;

    try
    {
        ids = JSON.parse(raw);
    }
    catch
    {
        throw new Error("Invalid order payload");
    }

    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    {
        throw new Error("Invalid order payload");
    }

    await reorderShopItems(ids);

    revalidatePath("/admin");
    revalidatePath("/shop");
}

export async function updateUserRoleAction(formData: FormData)
{
    await requireAdmin();

    const id = parseId(formData);
    const role = String(formData.get("role") ?? "").trim();

    if (role !== "user" && role !== "admin" && role !== "banned" && role !== "reviewer")
    {
        throw new Error("Invalid role");
    }

    await updateUserRole(id, role as UserRole);

    revalidatePath("/admin");
}

export async function updateInternalNoteAction(formData: FormData)
{
    await requireAdmin();

    const id = parseId(formData);
    const note = String(formData.get("note") ?? "");

    await updateInternalNote(id, note);

    revalidatePath("/admin");
}
