import ProjectPage from "@/components/ProjectPage";
import { getAllSlugs, getProject } from "@/lib/projects";

// Generates static pages for all projects at build time
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Sets page title from project data
export async function generateMetadata({ params }) {
  const project = getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.name} — ${project.tag}`,
    description: project.unlockHeadline,
    openGraph: {
      title: `${project.name} — ${project.tagline}`,
      description: project.unlockHeadline,
      images: project.heroImage ? [{ url: project.heroImage }] : [],
    },
  };
}

export default function ProjectRoute({ params }) {
  return <ProjectPage slug={params.slug} />;
}
