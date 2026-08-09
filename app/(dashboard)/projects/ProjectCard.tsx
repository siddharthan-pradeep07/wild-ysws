import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function ProjectCard({
    project,
    canManage,
}: {
    project: Project;
    canManage: boolean;
})
{
    return (
        <div className="shop-card">
            {project.screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={project.screenshotUrl}
                    alt={project.name}
                    className="shop-card-image"
                />
            ) : (
                <div className="shop-item-thumb shop-item-thumb-empty" aria-hidden="true" />
            )}

            <h2 className="shop-card-name px-2">{project.name}</h2>

            <div className="shop-item-actions px-2 pb-2">
                {canManage && (
                    <Link href={`/projects?compose=edit&id=${project.id}`} className="btn-primary">
                        Edit
                    </Link>
                )}
                {/* Placebo for now — no handler, no form action, genuinely does nothing. */}
                <button type="button" className="btn-primary">
                    Submit
                </button>
            </div>
        </div>
    );
}
