export type JourneyEntry = {
  id: string;
  period: string;
  title: string;
  category: "Education" | "Research" | "Observing" | "Recognition";
  institution: string;
  description: string;
};

export const journey: JourneyEntry[] = [
  {
    id: "current",
    period: "Current",
    title: "Observational Astrophysics Research",
    category: "Research",
    institution: "Verified affiliation will be added from the curriculum vitae.",
    description:
      "Ongoing research on magnetic activity in M-dwarf stars combining optical, spectroscopic and radio observations.",
  },
  {
    id: "ugmrt-observations",
    period: "Ongoing",
    title: "uGMRT observing programme",
    category: "Observing",
    institution: "upgraded Giant Metrewave Radio Telescope",
    description:
      "Low-frequency radio observations of low-mass stars. Verified proposal details will be added from approved telescope records.",
  },
  {
    id: "optical-observations",
    period: "Ongoing",
    title: "HCT and DOT optical / spectroscopic campaigns",
    category: "Observing",
    institution: "IAO Hanle · ARIES Devasthal",
    description:
      "Photometric and spectroscopic monitoring of active M-dwarfs. Verified observation logs will be populated from telescope records.",
  },
  {
    id: "education",
    period: "Earlier",
    title: "Academic training in physics and astrophysics",
    category: "Education",
    institution: "Verified academic institutions will be added from the CV.",
    description:
      "Formal degrees, supervisors and dates will be populated from Diya Ram's verified curriculum vitae.",
  },
];
