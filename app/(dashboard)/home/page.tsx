import { getSessionUser } from "@/lib/session";
import { isHackatimeConnected } from "@/lib/users";

export default async function HomeDashboardPage()
{
    const user = await getSessionUser();
    const connected = user?.email ? await isHackatimeConnected(user.email) : true;

    return (
        <div className="info-box text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                Welcome to the dashboard!
            </h1>
            <p className="text-lg text-strong">
                the dashboard is under construction, feel free to explore the shop and try creating projects, Most of the work went towards making the admin panel which is sadly not visible to users, but hold tight I am about to make this website the best ysws website ever, reach out to @siddharthan in #wild or DMs (slack) if you have any questions or suggestions, and I will try to get back to you as soon as possible.
            </p>

            {user && !connected && (
                <div className="mt-6">
                    <p className="text-lg text-strong mb-3">
                        Connect Hackatime to submit projects.
                    </p>
                    <a
                        href={`/api/hackatime/login?returnTo=${encodeURIComponent("/home")}`}
                        className="btn-primary self-start"
                    >
                        Connect Hackatime
                    </a>
                </div>
            )}
        </div>
    )
}
