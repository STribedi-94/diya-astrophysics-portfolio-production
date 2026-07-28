// Single source of truth for the Contact page.
// Identity fields mirror src/data/about.ts (aboutIdentity) — keep them in sync.

export const contactIdentity = {
  name: "Diya Ram",
  position: "Bridge Fellow · Observational Stellar Astrophysics",
  department: "Department of Astrophysics and High Energy Physics",
  institution: "S. N. Bose National Centre for Basic Sciences",
  location: "Salt Lake, Kolkata, West Bengal, India",
  email: "ramdiya1996@gmail.com",
  emailSubject: "Academic enquiry via astrophysics portfolio",
} as const;

export const contactPurposes = [
  "Research Collaboration",
  "Observational Collaboration",
  "Postdoctoral or Academic Opportunity",
  "Conference or Invited Talk",
  "Seminar or Workshop Invitation",
  "Peer Review or Editorial Communication",
  "Student or Research Guidance",
  "Scientific Outreach",
  "General Academic Enquiry",
  "Other",
] as const;

export type ContactPurpose = (typeof contactPurposes)[number];

// Compact "Review Diya's Work" links — existing routes only.
export const reviewLinks = [
  { label: "About", to: "/about" },
  { label: "Academic Journey", to: "/academic-journey" },
  { label: "Research", to: "/research" },
  { label: "Publications", to: "/publications" },
  { label: "Observations", to: "/observations" },
  { label: "Conferences", to: "/conferences" },
  { label: "Teaching", to: "/teaching" },
  { label: "Gallery", to: "/gallery" },
  { label: "Downloads", to: "/downloads" },
  { label: "Scientific Mission Log", to: "/mission-log" },
] as const;

export const privacyNote =
  "Information submitted through this form will be used solely for responding to your enquiry. Please avoid sharing sensitive personal information. Academic and professional enquiries are preferred. While every effort will be made to respond, replies cannot always be guaranteed within a specific timeframe.";
