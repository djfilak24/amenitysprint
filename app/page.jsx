import AmenitySprint from "../components/AmenitySprint";
import { getAllProjects } from "../lib/projects";

export const metadata = {
  title: "NELSON Asset Strategy — Amenity Sprint",
  description: "Rapid repositioning concept design for commercial real estate.",
};

export default function HomePage() {
  const projects = getAllProjects();
  return <AmenitySprint projects={projects} />;
}
