// Single source of truth for policy metadata used by the Privacy page and footer.

export const POLICY_LAST_UPDATED_ISO = "2026-07-30";
export const POLICY_LAST_UPDATED_LABEL = "30 July 2026";

export const COPYRIGHT_SECTION_ID = "research-copyright-citation-intellectual-property";
export const COPYRIGHT_SECTION_HREF = `/privacy#${COPYRIGHT_SECTION_ID}`;

export const privacySections = [
  { id: "overview", label: "Overview" },
  { id: "information", label: "Information" },
  { id: "use-of-information", label: "Use of Information" },
  { id: "contact-communication", label: "Contact & Communication" },
  { id: "technical-data", label: "Technical Data" },
  { id: "research-statistics", label: "Research Statistics" },
  { id: "research-materials", label: "Research Materials" },
  { id: "external-services", label: "External Services" },
  { id: "security", label: "Security" },
  { id: COPYRIGHT_SECTION_ID, label: "Copyright & Citation" },
  { id: "policy-updates", label: "Policy Updates" },
  { id: "policy-contact", label: "Contact" },
] as const;

export type PrivacySection = (typeof privacySections)[number];
