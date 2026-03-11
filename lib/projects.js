import projectsData from './projects-data.json';

export const TIERS = projectsData.tiers;
export const FEATURED_SLUGS = projectsData.featuredSlugs;
export const PROJECTS = projectsData.projects;

/** Returns an array of project objects for the landing page card grid */
export function getFeaturedProjects() {
  return FEATURED_SLUGS
    .filter((slug, i, arr) => arr.indexOf(slug) === i) // dedupe
    .map(slug => PROJECTS[slug])
    .filter(Boolean);
}

/** Returns a single project by slug, or null */
export function getProject(slug) {
  return PROJECTS[slug] || null;
}

/** Returns all slugs — used for Next.js generateStaticParams */
export function getAllSlugs() {
  return Object.keys(PROJECTS);
}
