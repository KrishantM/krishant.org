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
  {
    name: "Azure Databricks Platform Architect",
    provider: "Databricks",
    code: "Platform Architect",
    status: "Active",
    category: "Data Platform Architecture",
    credentialUrl: null,
  },
  {
    name: "Microsoft Certified: Azure Fundamentals",
    provider: "Microsoft",
    code: "AZ-900",
    status: "Active",
    category: "Cloud Foundations",
    credentialUrl: null,
  },
  {
    name: "Databricks Fundamentals",
    provider: "Databricks",
    code: "Fundamentals",
    status: "Active",
    category: "Data Platforms",
    credentialUrl: null,
  },
];

/**
 * Footer note for the certifications block. Update this when new cert
 * providers are added so the component needs no edit.
 */
export const certificationsFooterNote =
  "Cloud, data and AI architecture, with more on the way.";

/**
 * Capability pillars shaped by professional experience + certified depth.
 * Presented as a restrained signal — not a résumé skill list.
 */
export const skillPillars: string[] = [
  "Agentic engineering",
  "AI and cloud architecture",
  "Context engineering",
  "Security thinking",
  "Enterprise delivery",
  "Systems thinking",
];

/**
 * High-level PwC credibility copy. Deliberately abstract: no client names,
 * no specific projects, no confidential detail. PwC is professional
 * background — not an independent venture.
 */
export const pwc = {
  name: "PwC",
  role: "Day job",
  statement:
    "By day I'm an AI engineer and solution architect at PwC New Zealand, in the Digital Strategy & Architecture team. I build agentic systems and cloud architecture for large organisations, which means shipping AI inside the kind of security, governance and scale most product builders never see.",
  themes: [
    "Agentic engineering",
    "AI architecture",
    "Azure and AWS",
    "Data platforms",
    "Security and governance",
    "Enterprise delivery",
  ],
} as const;
