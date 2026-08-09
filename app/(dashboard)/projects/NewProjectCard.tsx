import Link from "next/link";
import LinkPendingIndicator from "@/components/LinkPendingIndicator";

export default function NewProjectCard()
{
    return (
        <Link href="/projects?compose=new" className="new-project-card">
            <span className="new-project-card-plus" aria-hidden="true">
                +
            </span>
            <span className="new-project-card-label">
                New project
                <LinkPendingIndicator />
            </span>
        </Link>
    );
}
