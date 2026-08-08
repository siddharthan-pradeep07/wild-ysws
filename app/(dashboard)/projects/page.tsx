import { cookies } from "next/headers";
import { listProjects, PROJECT_TYPES } from "@/lib/projects";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";
import { isHackatimeConnected } from "@/lib/users";
import { createProjectAction } from "./actions";
import ProjectCard from "./ProjectCard";

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

    const admin = await isAdmin(user.email);
    const projects = await listProjects();

    const showPicker = params.pickHackatime === "1";
    const selectedHackatimeProject =
        typeof params.hackatimeProject === "string" ? params.hackatimeProject : "";

    let hackatimeChoices: string[] = [];
    if (showPicker)
    {
        const cookieStore = await cookies();
        const raw = cookieStore.get("hackatime_projects")?.value;
        try
        {
            hackatimeChoices = raw ? JSON.parse(raw) : [];
        }
        catch
        {
            hackatimeChoices = [];
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="admin-panel-section text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                    Projects
                </h1>

                {params.hackatimeError === "1" && (
                    <p className="text-lg text-strong mb-4">
                        Couldn&apos;t connect to Hackatime — try again.
                    </p>
                )}

                <h2 className="text-xl md:text-2xl font-bold mb-4 text-strong">
                    Add new project
                </h2>

                {showPicker && (
                    <div className="hackatime-picker">
                        <p className="font-bold text-strong">Pick a Hackatime project</p>
                        {hackatimeChoices.length === 0 ? (
                            <p className="text-strong">
                                No Hackatime projects found on your account.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2 items-start">
                                {hackatimeChoices.map((name) => (
                                    <a
                                        key={name}
                                        href={`/projects?hackatimeProject=${encodeURIComponent(name)}`}
                                        className="btn-primary"
                                    >
                                        {name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <form action={createProjectAction} className="flex flex-col gap-3">
                    <input
                        name="name"
                        placeholder="Name"
                        required
                        className="input-email"
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        rows={3}
                        className="input-email"
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-strong">
                            Screenshot
                        </label>
                        <input
                            type="file"
                            name="screenshot"
                            accept="image/*"
                            className="input-email"
                        />
                    </div>

                    <input
                        name="codeUrl"
                        placeholder="Code URL"
                        className="input-email"
                    />
                    <input
                        name="demoUrl"
                        placeholder="Demo URL"
                        className="input-email"
                    />
                    <input
                        name="readmeUrl"
                        placeholder="Readme URL"
                        className="input-email"
                    />

                    <select
                        name="projectType"
                        defaultValue=""
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
                        placeholder="AI justification — how did you use AI on this project?"
                        rows={3}
                        className="input-email"
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold text-strong">
                            Hackatime project
                        </label>
                        {selectedHackatimeProject ? (
                            <p className="text-strong">
                                Linked: <strong>{selectedHackatimeProject}</strong>{" "}
                                <a href="/api/hackatime/login" className="underline">
                                    change
                                </a>
                            </p>
                        ) : (
                            <a href="/api/hackatime/login" className="btn-primary self-start">
                                Connect Hackatime
                            </a>
                        )}
                        <input
                            type="hidden"
                            name="hackatimeProject"
                            value={selectedHackatimeProject}
                        />
                    </div>

                    <button type="submit" className="btn-primary self-start">
                        Add project
                    </button>
                </form>
            </div>

            <div className="admin-panel-section text-left">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-strong">
                    Current Projects ({projects.length})
                </h2>

                {projects.length === 0 ? (
                    <p className="text-lg text-strong">
                        No projects yet — be the first to add one!
                    </p>
                ) : (
                    <div className="shop-grid">
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
                )}
            </div>
        </div>
    );
}
