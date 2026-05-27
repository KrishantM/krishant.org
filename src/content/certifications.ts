import type { Certification } from "@/types/certification";

/**
 * THE single source of truth for certifications — separate from ventures.
 *
 * To add a certification (e.g. an Azure cert): append one object below. Do not
 * invent issue dates or credential URLs — leave them undefined / null until a
 * real value exists.
 */
export const certifications: Certification[] = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    provider: "Amazon Web Services",
    code: "SAA-C03",
    status: "Active",
    category: "Cloud Architecture",
    credentialUrl: null,
  },
  {
    name: "AWS Certified Cloud Practitioner",
    provider: "Amazon Web Services",
    code: "CLF-C02",
    status: "Active",
    category: "Cloud Foundations",
    credentialUrl: null,
  },
];

/**
 * Capability pillars shaped by professional experience + certified depth.
 * Presented as a restrained signal — not a résumé skill list.
 */
export const skillPillars: string[] = [
  "Cloud architecture",
  "Security thinking",
  "Enterprise delivery",
  "Consulting & communication",
  "Systems thinking",
  "Technical strategy",
];

/**
 * High-level PwC credibility copy. Deliberately abstract: no client names,
 * no specific projects, no confidential detail. PwC is professional
 * background — not an independent venture.
 */
export const pwc = {
  name: "PwC",
  role: "Professional background",
  statement:
    "Alongside my independent work, my experience at PwC has shaped how I think about cloud, architecture, security, enterprise technology, and delivery in complex environments, grounding what I build in both technical execution and real-world organisational context.",
  themes: [
    "Cloud",
    "Architecture",
    "Security",
    "Consulting",
    "Stakeholder communication",
    "Enterprise technology",
    "Delivery",
    "Systems thinking",
  ],
} as const;
