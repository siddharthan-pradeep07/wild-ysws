"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import { PROJECT_TYPES } from "@/lib/projects";
import { deleteProjectAction, updateProjectAction } from "./actions";

export default function ProjectCard({
    project,
    canManage,
}: {
    project: Project;
    canManage: boolean;
})
{
    const [isEditing, setIsEditing] = useState(false);

    async function handleUpdate(formData: FormData)
    {
        await updateProjectAction(formData);
        setIsEditing(false);
    }

    if (isEditing)
    {
        return (
            <div className="shop-card">
                <form action={handleUpdate} className="shop-item-edit-form">
                    <input type="hidden" name="id" value={project.id} />
                    {/* Hackatime linking only happens at creation — carried
                        forward unchanged so editing can't strand the user
                        mid-OAuth-redirect with this row's local state lost. */}
                    <input type="hidden" name="hackatimeProject" value={project.hackatimeProject} />

                    <input
                        name="name"
                        defaultValue={project.name}
                        placeholder="Name"
                        required
                        className="input-email"
                    />
                    <textarea
                        name="description"
                        defaultValue={project.description}
                        placeholder="Description"
                        rows={3}
                        className="input-email"
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-strong">
                            {project.screenshotUrl ? "Replace screenshot" : "Screenshot"}
                        </label>
                        {project.screenshotUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={project.screenshotUrl}
                                alt={project.name}
                                className="shop-card-image"
                            />
                        )}
                        <input
                            type="file"
                            name="screenshot"
                            accept="image/*"
                            className="input-email"
                        />
                    </div>

                    <input
                        name="codeUrl"
                        defaultValue={project.codeUrl}
                        placeholder="Code URL"
                        className="input-email"
                    />
                    <input
                        name="demoUrl"
                        defaultValue={project.demoUrl}
                        placeholder="Demo URL"
                        className="input-email"
                    />
                    <input
                        name="readmeUrl"
                        defaultValue={project.readmeUrl}
                        placeholder="Readme URL"
                        className="input-email"
                    />

                    <select
                        name="projectType"
                        defaultValue={project.projectType}
                        className="input-email"
                    >
                        <option value="">Project type…</option>
                        {PROJECT_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <textarea
                        name="aiUsage"
                        defaultValue={project.aiUsage}
                        placeholder="AI justification — how did you use AI on this project?"
                        rows={3}
                        className="input-email"
                    />

                    <div className="shop-item-actions">
                        <button type="submit" className="btn-primary">
                            Save
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="shop-item-actions px-2 pb-2">
                    {/* Placebo for now — no handler, does nothing. */}
                    <button type="button" className="btn-primary">
                        Submit
                    </button>
                    <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <button type="submit" className="btn-danger">
                            Delete
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-card">
            <div className="shop-card-header">
                <h2 className="shop-card-name">{project.name}</h2>
                {project.projectType && (
                    <span className="project-badge">{project.projectType}</span>
                )}
            </div>

            {project.screenshotUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={project.screenshotUrl}
                    alt={project.name}
                    className="shop-card-image"
                />
            )}

            {project.description && (
                <p className="shop-card-description">{project.description}</p>
            )}

            {(project.codeUrl || project.demoUrl || project.readmeUrl) && (
                <div className="project-links">
                    {project.codeUrl && (
                        <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                            Code
                        </a>
                    )}
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            Demo
                        </a>
                    )}
                    {project.readmeUrl && (
                        <a href={project.readmeUrl} target="_blank" rel="noopener noreferrer">
                            Readme
                        </a>
                    )}
                </div>
            )}

            {project.hackatimeProject && (
                <p className="shop-card-fulfillment">
                    Hackatime: {project.hackatimeProject}
                </p>
            )}

            <p className="shop-card-fulfillment">
                by {project.ownerName || project.ownerEmail || "someone"}
            </p>

            <div className="shop-item-actions px-2 pb-2">
                {canManage && (
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit
                    </button>
                )}
                {/* Placebo for now — no handler, does nothing. */}
                <button type="button" className="btn-primary">
                    Submit
                </button>
            </div>
        </div>
    );
}
