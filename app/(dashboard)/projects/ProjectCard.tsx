import Link from "next/link";
import { DEFAULT_PROJECT_IMAGE_URL, type Project } from "@/lib/projects";
import LinkPendingIndicator from "@/components/LinkPendingIndicator";

// Cards sit side by side in a fixed width horizontal grid, so long names
// and descriptions need a hard cap or they blow out the card instead of
// wrapping nicely. The full text is still available through the title
// tooltip on hover.
function truncate(text: string, max: number)
{
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

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
                <h2 className="shop-card-name" title={project.name}>
                    {truncate(project.name, 10)}
                </h2>
                <div className="shop-card-header-badges">
                    {project.projectType && (
                        <span className="project-badge">{project.projectType}</span>
                    )}
                    {!!hoursTracked && (
                        <span className="project-badge">{hoursTracked}h</span>
                    )}
                </div>
            </div>

            {(project.screenshotUrl || DEFAULT_PROJECT_IMAGE_URL) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={project.screenshotUrl || DEFAULT_PROJECT_IMAGE_URL}
                    alt={project.name}
                    className="shop-card-image"
                />
            )}

            {project.description && (
                <p className="shop-card-description" title={project.description}>
                    {truncate(project.description, 39)}
                </p>
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
