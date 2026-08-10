"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { toggleFeaturedItem } from "@/lib/users";

export async function toggleFeaturedItemAction(formData: FormData)
{
    const user = await getSessionUser();

    if (!user?.email)
    {
        return;
    }

    const itemId = String(formData.get("itemId") ?? "").trim();

    if (!itemId)
    {
        return;
    }

    await toggleFeaturedItem(user.email, itemId);

    revalidatePath("/shop");
}
