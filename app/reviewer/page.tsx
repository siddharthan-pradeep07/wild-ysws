import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { isReviewer } from "@/lib/users";
import Tabs from "@/components/Tabs";

export default async function ReviewerPage()
{
    const user = await getSessionUser();

    if (!user?.email || !(await isReviewer(user.email)))
    {
        redirect("/home");
    }

    const placeholderContent = (
        <div className="admin-panel-section text-left">
            <p className="text-lg text-strong">
                just testing, nothing&apos;s in here
            </p>
        </div>
    );

    return (
        <div className="reviewer-shell">
            <div className="reviewer-topbar">
                <span className="reviewer-logged-in-as">Logged in as {user.name}</span>
                <Link href="/home" className="btn-secondary">
                    Exit
                </Link>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-6 text-light">
                Reviewer panel
            </h1>

            <Tabs
                tabs={[
                    { key: "review", label: "Review", content: placeholderContent },
                    { key: "leaderboard", label: "Leaderboard", content: placeholderContent },
                ]}
            />
        </div>
    );
}
