import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdminUser } from "@/lib/admin";
import { listShopItems } from "@/lib/shop";
import { listUsers } from "@/lib/users";
import { createShopItemAction } from "./actions";
import AdminTabs from "./AdminTabs";
import ShopItemRow from "./ShopItemRow";

export default async function AdminPage()
{
    const user = await getSessionUser();

    if (!isAdminUser(user?.email))
    {
        redirect("/home");
    }

    const items = await listShopItems();
    const users = await listUsers();

    const shopTabContent = (
        <div className="flex flex-col gap-8">
            <div className="admin-panel-section text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-strong">
                    Add new shop item
                </h2>

                <form action={createShopItemAction} className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            name="name"
                            placeholder="Name"
                            required
                            className="input-email"
                        />
                        <input
                            name="price"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Price (barks)"
                            required
                            className="input-email"
                        />
                    </div>
                    <input
                        name="imageUrl"
                        placeholder="Image URL"
                        className="input-email"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        rows={3}
                        className="input-email"
                    />
                    <input
                        name="fulfillment"
                        placeholder="Fulfillment (e.g. Ships in 2 weeks, Instant digital code)"
                        className="input-email"
                    />
                    <button type="submit" className="btn-primary self-start">
                        Add Item
                    </button>
                </form>
            </div>

            <div className="admin-panel-section text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-strong">
                    Current Items ({items.length})
                </h2>

                {items.length === 0 ? (
                    <p className="text-lg text-strong">No shop items yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <ShopItemRow key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const placeholderContent = (
        <div className="admin-panel-section text-left">
            <p className="text-lg text-strong">
                just testing, nothing&apos;s in here
            </p>
        </div>
    );

    const usersTabContent = (
        <div className="admin-panel-section text-left">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-strong">
                Users ({users.length})
            </h2>

            {users.length === 0 ? (
                <p className="text-lg text-strong">No one has logged in yet.</p>
            ) : (
                <div className="users-table">
                    <div className="users-table-row users-table-header">
                        <span>Name</span>
                        <span>Email</span>
                        <span>Slack ID</span>
                    </div>
                    {users.map((appUser) => (
                        <div key={appUser.id} className="users-table-row">
                            <span>{appUser.name || "—"}</span>
                            <span>{appUser.email || "—"}</span>
                            <span>{appUser.slackId || "—"}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl md:text-4xl font-bold text-strong">
                Admin panel
            </h1>

            <AdminTabs
                tabs={[
                    { key: "shop", label: "Shop", content: shopTabContent },
                    {
                        key: "placeholder-1",
                        label: "review",
                        content: placeholderContent,
                    },
                    {
                        key: "placeholder-2",
                        label: "leaderboard",
                        content: placeholderContent,
                    },
                    {
                        key: "users",
                        label: "Users",
                        content: usersTabContent,
                    },
                ]}
            />
        </div>
    );
}
