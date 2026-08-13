"use client";

import { useLinkStatus } from "next/link";

// This needs to be rendered as a direct child of a Link, since it reads
// that Link's own pending state. That state flips true the instant it's
// clicked, well before the destination page or its loading.tsx has
// anything to show.
export default function LinkPendingIndicator()
{
    const { pending } = useLinkStatus();

    if (!pending)
    {
        return null;
    }

    return <span className="link-pending-spinner" aria-hidden="true" />;
}
