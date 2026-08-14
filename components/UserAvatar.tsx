import { getSessionUser } from "@/lib/session";
import { getSlackAvatarUrl } from "@/lib/slack";

export default async function UserAvatar()
{
    const user = await getSessionUser();

    if (!user?.slack_id)
    {
        return null;
    }

    const avatarUrl = await getSlackAvatarUrl(user.slack_id);

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
                className="user-avatar-image mb-3"
            />
            <p>{user.name}</p>
        </div>
        
    );
}
