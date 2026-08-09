"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects";
import { PROJECT_TYPES } from "@/lib/projects";
import type { HackatimeProjectStat } from "@/lib/users";
import { createProjectAction, deleteProjectAction, updateProjectAction } from "./actions";
import LoadingSpinner from "@/components/LoadingSpinner";

const FORM_ID = "project-compose-form";

type ProjectComposeModalProps =
{
    mode: "new" | "edit";
    project?: Project;
    hackatimeProjects: HackatimeProjectStat[];
};

export default function ProjectComposeModal({
    mode,
    project,
    hackatimeProjects,
}: ProjectComposeModalProps)
{
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [pendingLabel, setPendingLabel] = useState("Saving...");

    function close()
    {
        router.push("/projects");
    }

    function handleSave(formData: FormData)
    {
        setPendingLabel(mode === "edit" ? "Saving changes..." : "Creating project...");
        startTransition(async () =>
        {
            if (mode === "edit")
            {
                await updateProjectAction(formData);
            }
            else
            {
                await createProjectAction(formData);
            }
            close();
        });
    }

    function handleDelete(formData: FormData)
    {
        setPendingLabel("Deleting project...");
        startTransition(async () =>
        {
            await deleteProjectAction(formData);
            close();
        });
    }

    const connectReturnTo =
        mode === "edit" && project
            ? `/projects?compose=edit&id=${project.id}`
            : "/projects?compose=new";

    // Always include the project's already-linked value even if it's since
    // fallen out of their live Hackatime list, so saving doesn't silently
    // drop it.
    const hackatimeOptions = Array.from(
        new Set([
            ...hackatimeProjects.map((p) => p.name),
            ...(project?.hackatimeProject ? [project.hackatimeProject] : []),
        ])
    );

    if (isPending)
    {
        return (
            <div className="modal-backdrop" role="presentation">
                <div
                    className="modal-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label={mode === "edit" ? "Edit project" : "New project"}
                >
                    <LoadingSpinner label={pendingLabel} />
                </div>
            </div>
        );
    }

    return (
        <div className="modal-backdrop" role="presentation" onClick={close}>
            <div
                className="modal-panel"
                role="dialog"
                aria-modal="true"
                aria-label={mode === "edit" ? "Edit project" : "New project"}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="text-xl font-bold text-strong">
                        {mode === "edit" ? "Edit project" : "New project"}
                    </h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={close}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form id={FORM_ID} action={handleSave} className="project-form-grid">
                    {mode === "edit" && project && (
                        <input type="hidden" name="id" value={project.id} />
                    )}

                    <input
                        name="name"
                        defaultValue={project?.name}
                        placeholder="Name"
                        required
                        className="input-email"
                    />
                    <select
                        name="projectType"
                        defaultValue={project?.projectType ?? ""}
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
                        name="description"
                        defaultValue={project?.description}
                        placeholder="Description"
                        rows={3}
                        className="input-email project-form-span-2"
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-strong">
                            {project?.screenshotUrl ? "Replace screenshot" : "Screenshot"}
                        </label>
                        {project?.screenshotUrl && (
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

                    <div className="project-form-stack">
                        <input
                            name="codeUrl"
                            defaultValue={project?.codeUrl}
                            placeholder="Code URL"
                            className="input-email"
                        />
                        <input
                            name="demoUrl"
                            defaultValue={project?.demoUrl}
                            placeholder="Demo URL"
                            className="input-email"
                        />
                        <input
                            name="readmeUrl"
                            defaultValue={project?.readmeUrl}
                            placeholder="Readme URL"
                            className="input-email"
                        />
                    </div>

                    <textarea
                        name="aiUsage"
                        defaultValue={project?.aiUsage}
                        placeholder="AI justification — how did you use AI on this project?"
                        rows={3}
                        className="input-email project-form-span-2"
                    />

                    <div className="flex flex-col gap-1 project-form-span-2">
                        <label className="text-sm font-bold text-strong">
                            Hackatime project
                        </label>
                        <div className="flex flex-row gap-2">
                            <select
                                name="hackatimeProject"
                                defaultValue={project?.hackatimeProject ?? ""}
                                className="input-email flex-1"
                            >
                                <option value="">None</option>
                                {hackatimeOptions.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <a
                                href={`/api/hackatime/login?returnTo=${encodeURIComponent(connectReturnTo)}`}
                                className="btn-primary shrink-0"
                                title="Refresh your Hackatime project list"
                            >
                                ↻ Refresh
                            </a>
                        </div>
                    </div>
                </form>

                <div className="shop-item-actions mt-4">
                    {mode === "edit" && project && (
                        <>
                            {/* Placebo for now — no handler, does nothing. */}
                            <button type="button" className="btn-primary">
                                Submit
                            </button>
                            <form action={handleDelete}>
                                <input type="hidden" name="id" value={project.id} />
                                <button type="submit" className="btn-danger">
                                    Delete
                                </button>
                            </form>
                        </>
                    )}
                    <button type="submit" form={FORM_ID} className="btn-primary">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
