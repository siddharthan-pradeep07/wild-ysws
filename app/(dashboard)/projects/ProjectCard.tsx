import Link from "next/link";
import type { Project } from "@/lib/projects";
import LinkPendingIndicator from "@/components/LinkPendingIndicator";

export default function ProjectCard({
    project,
    canManage,
    hoursTracked,
}: {
    project: Project;
    canManage: boolean;
    hoursTracked?: number | null;
})
{
    return (
        <div className="shop-card">
            <div className="shop-card-header">
                <h2 className="shop-card-name">{project.name}</h2>
                <div className="shop-card-header-badges">
                    {project.projectType && (
                        <span className="project-badge">{project.projectType}</span>
                    )}
                    {!!hoursTracked && (
                        <span className="project-badge">{hoursTracked}h</span>
                    )}
                </div>
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

            <div className="shop-item-actions px-2 pb-2">
                {canManage && (
                    <Link href={`/projects?compose=edit&id=${project.id}`} className="btn-secondary">
                        Edit
                        <LinkPendingIndicator />
                    </Link>
                )}
                <button type="button" className="btn-secondary">
                    Submit
                </button>
            </div>
        </div>
    );
}
