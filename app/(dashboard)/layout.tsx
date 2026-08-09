import { Suspense } from "react";
import Sidebar from "@/components/sidebar";
import UserAvatar from "@/components/UserAvatar";
import { getSessionUser } from "@/lib/session";
import { isAdmin as checkIsAdmin } from "@/lib/admin";

export default async function DashboardLayout({ children } : { children: React.ReactNode})
{
    const user = await getSessionUser();
    const isAdmin = await checkIsAdmin(user?.email);

    return (
        <div className="dashboard-shell">
            {/* Avatar comes from a live Slack API call — Suspense keeps it
                from blocking the sidebar/content on every navigation. */}
            <Suspense fallback={null}>
                <UserAvatar />
            </Suspense>
            <Sidebar isAdmin={isAdmin} />
            <div className="dashboard-content">
                {children}
            </div>
        </div>
    )
}
