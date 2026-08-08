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
                ljiefbgsfdihvdfilhbd OVUIHEBFVOEFBVOWHFOVVHD 632197856123785640 $#$&^%^&$%$
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
