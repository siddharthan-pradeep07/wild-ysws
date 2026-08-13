"use client";

import { useState } from "react";
import { DEFAULT_PROJECT_IMAGE_URL, type Project } from "@/lib/projects";

function formatDate(value: string)
{
    if (!value)
    {
        return "—";
    }

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ProjectRow({
    project,
    slackId,
}: {
    project: Project;
    slackId: string;
})
{
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div className="projects-table-row">
                <span>{project.name || "—"}</span>
                <span>{project.ownerName || "—"}</span>
                <span>{project.ownerEmail || "—"}</span>
                <span>{project.projectType || "—"}</span>
                <span>{formatDate(project.createdAt)}</span>
                <button
                    type="button"
                    className="users-row-expand-btn"
                    onClick={() => setIsExpanded((value) => !value)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Hide project details" : "Show project details"}
                >
                    ⋯
                </button>
            </div>

            {isExpanded && (
                <div className="users-detail-panel">
                    <div className="users-detail-grid">
                        <span className="users-detail-label">Slack ID</span>
                        <span>{slackId || "—"}</span>

                        <span className="users-detail-label">Description</span>
                        <span>{project.description || "—"}</span>

                        <span className="users-detail-label">Hackatime project</span>
                        <span>{project.hackatimeProject || "—"}</span>

                        <span className="users-detail-label">Code URL</span>
                        <span>
                            {project.codeUrl ? (
                                <a
                                    href={project.codeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-detail-link"
                                >
                                    {project.codeUrl}
                                </a>
                            ) : (
                                "—"
                            )}
                        </span>

                        <span className="users-detail-label">Demo URL</span>
                        <span>
                            {project.demoUrl ? (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-detail-link"
                                >
                                    {project.demoUrl}
                                </a>
                            ) : (
                                "—"
                            )}
                        </span>

                        <span className="users-detail-label">Readme URL</span>
                        <span>
                            {project.readmeUrl ? (
                                <a
                                    href={project.readmeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-detail-link"
                                >
                                    {project.readmeUrl}
                                </a>
                            ) : (
                                "—"
                            )}
                        </span>

                        <span className="users-detail-label">AI usage</span>
                        <span>{project.aiUsage || "—"}</span>
                    </div>

                    {(project.screenshotUrl || DEFAULT_PROJECT_IMAGE_URL) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={project.screenshotUrl || DEFAULT_PROJECT_IMAGE_URL}
                            alt={project.name}
                            className="modal-image-preview"
                        />
                    )}
                </div>
            )}
        </>
    );
}
