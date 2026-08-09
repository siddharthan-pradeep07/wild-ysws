import { getProject, listProjectsByOwner } from "@/lib/projects";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { getHackatimeProjects, isHackatimeConnected } from "@/lib/users";
import NewProjectCard from "./NewProjectCard";
import ProjectCard from "./ProjectCard";
import ProjectComposeModal from "./ProjectComposeModal";

export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
})
{
    const params = await searchParams;
    const user = await getSessionUser();

    if (!user?.email)
    {
        return (
            <div className="info-box text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                    Projects
                </h1>
                <p className="text-lg text-strong">Log in to view and submit projects.</p>
            </div>
        );
    }

    const connected = await isHackatimeConnected(user.email);

    if (!connected)
    {
        return (
            <div className="info-box text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                    Projects
                </h1>
                <p className="text-lg text-strong mb-6">
                    Connect Hackatime to continue.
                </p>
                <a
                    href={`/api/hackatime/login?returnTo=${encodeURIComponent("/projects")}`}
                    className="btn-primary self-start"
                >
                    Connect Hackatime
                </a>
            </div>
        );
    }

    const composeMode = params.compose === "edit" ? "edit" : params.compose === "new" ? "new" : null;
    const composeId = typeof params.id === "string" ? params.id : "";

    // None of these four depend on each other's result, so run them
    // concurrently instead of one-after-another. isAdmin/getHackatimeProjects
    // share the same memoized user-record lookup under the hood (see
    // lib/users.ts), so running them together doesn't double that fetch.
    const [admin, projects, composeProject, hackatimeProjects] = await Promise.all([
        isAdmin(user.email),
        listProjectsByOwner(user.email), // own projects only — never a shared gallery
        composeMode === "edit" && composeId ? getProject(composeId) : Promise.resolve(undefined),
        composeMode ? getHackatimeProjects(user.email) : Promise.resolve([]),
    ]);

    const canEditCompose =
        composeMode === "edit" && composeProject
            ? admin || composeProject.ownerEmail.toLowerCase() === user.email.toLowerCase()
            : true;

    return (
        <div className="info-box text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                Projects
            </h1>

            {params.hackatimeError === "1" && (
                <p className="text-lg text-strong mb-4">
                    Couldn&apos;t connect to Hackatime — try again.
                </p>
            )}

            <div className="shop-grid">
                <NewProjectCard />
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        canManage={
                            admin ||
                            user.email!.toLowerCase() === project.ownerEmail.toLowerCase()
                        }
                    />
                ))}
            </div>

            {composeMode && canEditCompose && (composeMode === "new" || composeProject) && (
                <ProjectComposeModal
                    mode={composeMode}
                    project={composeProject}
                    hackatimeProjects={hackatimeProjects}
                />
            )}
        </div>
    );
}
