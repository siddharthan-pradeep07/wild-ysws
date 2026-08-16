import { getSessionUser } from "@/lib/session";
import { getSlackAvatarUrl } from "@/lib/slack";
import { getBarks } from "@/lib/users";
import CurrencyIcon from "@/components/CurrencyIcon";

export default async function UserAvatar()
{
    const user = await getSessionUser();

    if (!user?.slack_id)
    {
        return null;
    }

    const [avatarUrl, barks] = await Promise.all([
        getSlackAvatarUrl(user.slack_id),
        getBarks(user.email),
    ]);

    if (!avatarUrl)
    {
        return null;
    }

    return (
        <div className="user-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={avatarUrl}
                alt={user.name ? `${user.name}'s Slack avatar` : "Your Slack avatar"}
                className="user-avatar-image"
            />
            <div className="user-avatar-info">
                <span className="user-avatar-name">{user.name}</span>
                <span className="user-avatar-barks">
                    {barks} <CurrencyIcon />
                </span>
            </div>
        </div>
    );
}
