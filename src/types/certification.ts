/**
 * Certification model — deliberately separate from the Venture model so the
 * Credentials section never bleeds into the Ventures section, and so future
 * certifications (Azure, GCP, etc.) can be added by appending one object.
 */

export type CertificationStatus = "Active" | "In Progress" | "Expired";

export interface Certification {
  /** Full certification name, e.g. "AWS Certified Solutions Architect – Associate". */
  name: string;
  /** Issuing body, e.g. "Amazon Web Services". */
  provider: string;
  /** Exam / credential code, e.g. "SAA-C03". */
  code: string;
  status: CertificationStatus;
  /** Grouping label, e.g. "Cloud Architecture". */
  category: string;
  /** ISO date string (optional). Leave undefined rather than inventing one. */
  issuedDate?: string;
  /** Public verification link (optional). Leave null until a real URL exists. */
  credentialUrl?: string | null;
}
