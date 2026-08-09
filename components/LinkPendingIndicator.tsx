"use client";

import { useLinkStatus } from "next/link";

// Must be rendered as a direct child of a <Link> — it reads that Link's own
// pending state, which flips true the instant it's clicked, well before the
// destination page (or its loading.tsx) has anything to show.
export default function LinkPendingIndicator()
{
    const { pending } = useLinkStatus();

    if (!pending)
    {
        return null;
    }

    return <span className="link-pending-spinner" aria-hidden="true" />;
}
