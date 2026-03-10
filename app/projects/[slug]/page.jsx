import ProjectPage from "@/components/ProjectPage";
import { getAllSlugs, getProject } from "@/lib/projects";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const project = getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.name} — ${project.tag}`,
    description: project.unlockHeadline,
  };
}

export default function ProjectRoute({ params }) {
  return <ProjectPage slug={params.slug} />;
}
