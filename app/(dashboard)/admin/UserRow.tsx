"use client";

import { useState, useTransition } from "react";
import type { AppUser } from "@/lib/users";
import UserRoleSelect from "./UserRoleSelect";
import { updateInternalNoteAction } from "./actions";

function formatDateTime(value: string)
{
    if (!value)
    {
        return "—";
    }

    return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function UserRow({ appUser }: { appUser: AppUser })
{
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSaveNote(formData: FormData)
    {
        startTransition(async () =>
        {
            await updateInternalNoteAction(formData);
        });
    }

    return (
        <>
            <div className="users-table-row">
                <span>{appUser.name || "—"}</span>
                <span>{appUser.email || "—"}</span>
                <span>{appUser.slackId || "—"}</span>
                <span>
                    {new Date(appUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
                <span>{appUser.hackatimeConnected ? "Yes" : "No"}</span>
                <UserRoleSelect id={appUser.id} role={appUser.role} />
                <button
                    type="button"
                    className="users-row-expand-btn"
                    onClick={() => setIsExpanded((value) => !value)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Hide user details" : "Show user details"}
                >
                    ⋯
                </button>
            </div>

            {isExpanded && (
                <div className="users-detail-panel">
                    <div className="users-detail-grid">
                        <span className="users-detail-label">User ID</span>
                        <span>{appUser.userId || "—"}</span>

                        <span className="users-detail-label">YSWS eligible</span>
                        <span>{appUser.yswsEligible ? "Yes" : "No"}</span>

                        <span className="users-detail-label">Verification status</span>
                        <span>{appUser.verificationStatus || "—"}</span>

                        <span className="users-detail-label">Hackatime connected</span>
                        <span>{appUser.hackatimeConnected ? "Yes" : "No"}</span>

                        <span className="users-detail-label">Hackatime connected since</span>
                        <span>{formatDateTime(appUser.hackatimeConnectedAt)}</span>

                        <span className="users-detail-label">Last login</span>
                        <span>{formatDateTime(appUser.lastLogin)}</span>

                        <span className="users-detail-label">Login count</span>
                        <span>{appUser.loginCount}</span>

                        <span className="users-detail-label">Barks balance</span>
                        <span>{appUser.barks}</span>
                    </div>

                    <form action={handleSaveNote} className="users-detail-note-form">
                        <input type="hidden" name="id" value={appUser.id} />
                        <label className="users-detail-label" htmlFor={`note-${appUser.id}`}>
                            Internal note
                        </label>
                        <textarea
                            id={`note-${appUser.id}`}
                            name="note"
                            defaultValue={appUser.internalNote}
                            rows={3}
                            className="input-email"
                            placeholder="Notes only admins can see…"
                        />
                        <button
                            type="submit"
                            className="btn-primary self-start"
                            disabled={isPending}
                        >
                            {isPending ? "Saving..." : "Save note"}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
