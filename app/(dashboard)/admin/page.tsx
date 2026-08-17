import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { listShopItems } from "@/lib/shop";
import { listProjects } from "@/lib/projects";
import { listUsers } from "@/lib/users";
import { createShopItemAction } from "./actions";
import Tabs from "@/components/Tabs";
import ShopItemList from "./ShopItemList";
import UserRow from "./UserRow";
import ProjectRow from "./ProjectRow";

export default async function AdminPage()
{
    const user = await getSessionUser();

    if (!(await isAdmin(user?.email)))
    {
        redirect("/home");
    }

    const items = await listShopItems();
    const users = await listUsers();
    const projects = await listProjects();

    const slackByEmail = new Map(
        users.filter((appUser) => appUser.email).map((appUser) => [appUser.email.toLowerCase(), appUser.slackId])
    );

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
                    <label className="admin-checkbox-label">
                        <input type="checkbox" name="disabled" className="admin-checkbox" />
                        Disable this item (hidden from the shop until unchecked)
                    </label>
                    <button type="submit" className="btn-primary self-start">
                         Item.add
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
                    <ShopItemList items={items} />
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

    const projectsTabContent = (
        <div className="admin-panel-section text-left">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-strong">
                Projects ({projects.length})
            </h2>

            {projects.length === 0 ? (
                <p className="text-lg text-strong">No projects submitted yet.</p>
            ) : (
                <div className="users-table">
                    <div className="projects-table-row users-table-header">
                        <span>Name</span>
                        <span>Owner</span>
                        <span>Email</span>
                        <span>Type</span>
                        <span>Submitted</span>
                        <span aria-hidden="true"></span>
                    </div>
                    {projects.map((project) => (
                        <ProjectRow
                            key={project.id}
                            project={project}
                            slackId={slackByEmail.get(project.ownerEmail.toLowerCase()) ?? ""}
                        />
                    ))}
                </div>
            )}
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
                        <span>Date of joining</span>
                        <span>Hackatime connected</span>
                        <span>Role</span>
                        <span aria-hidden="true"></span>
                    </div>
                    {users.map((appUser) => (
                        <UserRow key={appUser.id} appUser={appUser} />
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

            <Tabs
                tabs={[
                    { key: "shop", label: "Shop", content: shopTabContent },
                    {
                        key: "projects",
                        label: "Projects",
                        content: projectsTabContent,
                    },
                    {
                        key: "review",
                        label: "Review",
                        content: placeholderContent,
                    },
                    {
                        key: "leaderboard",
                        label: "Leaderboard",
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
