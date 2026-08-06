import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdminUser } from "@/lib/admin";
import { listShopItems } from "@/lib/shop";
import { createShopItemAction, deleteShopItemAction, updateShopItemAction } from "./actions";

export default async function AdminPage()
{
    const user = await getSessionUser();

    if (!isAdminUser(user?.email))
    {
        redirect("/home");
    }

    const items = await listShopItems();

    return (
        <div className="flex flex-col gap-8">
            <div className="info-box text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-[#132A36]">
                    Admin — Shop Items
                </h1>
                <p className="text-lg text-[#132A36] mb-6">
                    Add a new item to the shop.
                </p>

                <form action={createShopItemAction} className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            name="name"
                            placeholder="Item name"
                            required
                            className="input-email"
                        />
                        <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price (USD)"
                            required
                            className="input-email"
                        />
                    </div>
                    <input
                        name="imageUrl"
                        placeholder="Image URL (optional)"
                        className="input-email"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        rows={3}
                        className="input-email"
                    />
                    <button type="submit" className="btn-primary self-start">
                        Add Item
                    </button>
                </form>
            </div>

            <div className="info-box text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#132A36]">
                    Current Items ({items.length})
                </h2>

                {items.length === 0 ? (
                    <p className="text-lg text-[#132A36]">No shop items yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="admin-item-row">
                                <form
                                    action={updateShopItemAction}
                                    className="admin-item-form"
                                >
                                    <input type="hidden" name="id" value={item.id} />
                                    <input
                                        name="name"
                                        defaultValue={item.name}
                                        placeholder="Item name"
                                        required
                                        className="input-email"
                                    />
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={item.price.toFixed(2)}
                                        placeholder="Price (USD)"
                                        required
                                        className="input-email"
                                    />
                                    <input
                                        name="imageUrl"
                                        defaultValue={item.imageUrl}
                                        placeholder="Image URL"
                                        className="input-email"
                                    />
                                    <input
                                        name="description"
                                        defaultValue={item.description}
                                        placeholder="Description"
                                        className="input-email"
                                    />
                                    <button type="submit" className="btn-primary">
                                        Save
                                    </button>
                                </form>
                                <form action={deleteShopItemAction}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button type="submit" className="btn-primary">
                                        Delete
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}