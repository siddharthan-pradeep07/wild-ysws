// Hack Club's own OAuth identity (lib/auth.ts, lib/session.ts) has no
// avatar field — see app/(dashboard)/admin history for why. Slack itself is
// the only source for the profile picture, via a Bot Token with the
// users:read scope, installed to the workspace the slack_id belongs to.

type SlackUsersInfoResponse =
{
    ok: boolean;
    error?: string;
    user?: {
        profile?: {
            image_192?: string;
            image_512?: string;
        };
    };
};

export async function getSlackAvatarUrl(slackId: string): Promise<string | null>
{
    const token = process.env.SLACK_BOT_TOKEN;

    if (!token || !slackId)
    {
        return null;
    }

    try
    {
        const res = await fetch(
            `https://slack.com/api/users.info?user=${encodeURIComponent(slackId)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            }
        );

        if (!res.ok)
        {
            return null;
        }

        // Slack's Web API returns HTTP 200 even for API-level errors
        // (bad token, unknown user, missing scope) — `ok` is the real signal.
        const data = (await res.json()) as SlackUsersInfoResponse;

        if (!data.ok)
        {
            return null;
        }

        return data.user?.profile?.image_192 ?? data.user?.profile?.image_512 ?? null;
    }
    catch
    {
        return null;
    }
}
