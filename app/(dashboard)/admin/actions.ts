"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdminUser } from "@/lib/admin";
import { createShopItem, deleteShopItem, updateShopItem } from "@/lib/shop";

// Every action re-checks admin status server-side, since Server Actions are
// reachable via direct POST requests, not just through the admin page's UI.
async function requireAdmin()
{
    const user = await getSessionUser();

    if (!isAdminUser(user?.email))
    {
        redirect("/home");
    }
}

function parseItemInput(formData: FormData)
{
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const price = Number(formData.get("price"));

    if (!name)
    {
        throw new Error("Item name is required");
    }
    if (!Number.isFinite(price) || price < 0)
    {
        throw new Error("Price must be a positive number");
    }

    return { name, description, imageUrl, price };
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
