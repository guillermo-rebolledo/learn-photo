import type { MetadataRoute } from "next";
import { lessons } from "@/lib/curriculum";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/sandbox", "/reference", "/night-sky"].map((path) => ({
    url: `${siteUrl}${path}`,
  }));
  const lessonRoutes = lessons.map(({ slug }) => ({ url: `${siteUrl}/lessons/${slug}` }));
  return [...staticRoutes, ...lessonRoutes];
}
