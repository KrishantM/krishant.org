import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { internalVentureSlugs } from "@/content/ventures";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...internalVentureSlugs.map((slug) => ({
      url: `${base}/ventures/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
