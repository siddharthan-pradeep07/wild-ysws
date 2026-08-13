// Hack Club's own OAuth identity in lib/auth.ts and lib/session.ts doesn't
// include an avatar field. Slack is the only source for the profile
// picture, fetched with a Bot Token that has the users:read scope,
// installed to the workspace the slack_id belongs to.

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

        // Slack's Web API returns HTTP 200 even for API level errors, like a
        // bad token, unknown user, or missing scope. The ok field in the
        // response body is the real signal for whether it worked.
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
