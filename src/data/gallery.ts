// Scientific Gallery — Astronomical Journey Archive
// Single source of truth. Every image record lives here and is used by
// filters, search, lightbox, timeline, facility explorer and conference archive.

import a01 from "@/assets/gallery/academic_bsc_physics_honours_batchmates_study_session_01.jpg.asset.json";
import a02 from "@/assets/gallery/academic_bsc_physics_honours_light_practical_lab_02.jpg.asset.json";
import a03 from "@/assets/gallery/academic_msc_astrophysics_annual_sports_day_group_photo_02.jpg.asset.json";
import a04 from "@/assets/gallery/academic_msc_astrophysics_moon_observation_14inch_telescope_01.jpg.asset.json";
import a05 from "@/assets/gallery/academic_msc_astrophysics_xavotsav_group_photo_03.jpg.asset.json";
import a06 from "@/assets/gallery/academic_phd_5000_word_thesis_submission_presentation_01.jpg.asset.json";
import a07 from "@/assets/gallery/academic_phd_final_hard_copy_thesis_submission_university_of_calcutta_02.jpg.asset.json";
import c08 from "@/assets/gallery/campus_teachers_day_celebration_cake_cutting_02.jpg.jpg.asset.json";
import c09 from "@/assets/gallery/campus_teachers_day_celebration_faculty_and_researchers_01.jpg.asset.json";
import c10 from "@/assets/gallery/campus_teachers_day_celebration_group_photo_03.jpg.asset.json";
import c11 from "@/assets/gallery/campus_teachers_day_celebration_outdoor_group_photo_04.jpg.asset.json";
import cf12 from "@/assets/gallery/conference_asi_2022_group_photo_02.jpg.asset.json";
import cf13 from "@/assets/gallery/conference_asi_2022_poster_presentation_m_dwarf_spectroscopy_01.jpg.asset.json";
import cf14 from "@/assets/gallery/conference_bina_group_photo_01.jpg.asset.json";
import cf15 from "@/assets/gallery/conference_bose_fest_2023_observational_facilities_presentation_01.jpg.asset.json";
import cf16 from "@/assets/gallery/conference_bose_fest_2023_observational_facilities_presentation_02.jpg.asset.json";
import cf17 from "@/assets/gallery/conference_bose_fest_2023_oral_presentation_01.jpg.asset.json";
import cf18 from "@/assets/gallery/conference_bose_fest_2023_oral_presentation_02.jpg.asset.json";
import cf19 from "@/assets/gallery/conference_bose_fest_2023_oral_presentation_03.jpg.asset.json";
import cf20 from "@/assets/gallery/conference_bose_fest_2024_poster_presentation_ad_leonis_01.jpg.asset.json";
import cf21 from "@/assets/gallery/conference_bose_fest_2025_oral_presentation_flare_energy_analysis_01.jpg.jpg.asset.json";
import cf22 from "@/assets/gallery/conference_bose_fest_2025_oral_presentation_starspots_02.jpg.jpg.asset.json";
import cf23 from "@/assets/gallery/conference_nsss_2024_poster_presentation_ad_leonis_01.jpg.asset.json";
import cf24 from "@/assets/gallery/conference_nsss_2024_symposium_participation_02.jpg.asset.json";
import cf25 from "@/assets/gallery/conference_star_formation_2024_research_team_group_photo_02.jpg.asset.json";
import cf26 from "@/assets/gallery/conference_star_formation_2024_supervisor_and_collaborators_01.jpg.asset.json";
import r27 from "@/assets/gallery/research_facility_aries_devasthal_dfot_13m_visit_01.jpg.asset.json";
import r28 from "@/assets/gallery/research_facility_aries_devasthal_dot_36m_observing_team_03.jpg.asset.json";
import r29 from "@/assets/gallery/research_facility_aries_devasthal_dot_36m_visit_02.jpg.asset.json";

export type GalleryCategory =
  | "facility"
  | "oral"
  | "poster"
  | "participation"
  | "milestone"
  | "academic"
  | "community";

export type GalleryRecord = {
  id: string;
  filename: string;
  src: string;
  title: string;
  caption: string;
  shortCaption: string;
  year?: number;
  date?: string;
  institution?: string;
  location?: string;
  event?: string;
  eventSeries?: string; // groups mini-albums
  stage?: string; // B.Sc. / M.Sc. / Ph.D. / Research Community
  category: GalleryCategory;
  tags: string[];
  facility?: string;
  topic?: string;
  presentationType?: "Oral Presentation" | "Poster Presentation" | "Participation" | "Group Photograph" | "Thesis Milestone" | "Facility Visit" | "Observing Run" | "Community";
  role?: string;
  featured?: boolean;
  priority?: number; // sort weight
  orientation: "landscape" | "portrait";
  alt: string;
  relatedRoute?: { to: string; label: string };
};

const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  facility: "Research Facilities",
  oral: "Oral Presentations",
  poster: "Poster Presentations",
  participation: "Conferences",
  milestone: "Academic Milestones",
  academic: "Academic Journey",
  community: "Research Community",
};

export const categoryLabel = (c: GalleryCategory) => CATEGORY_LABEL[c];

export const gallery: GalleryRecord[] = [
  {
    id: "dot-observing-team",
    filename: "research_facility_aries_devasthal_dot_36m_observing_team_03.jpg",
    src: r28.url,
    title: "3.6-m DOT — Observing Team",
    caption:
      "Research team at the 3.6-meter Devasthal Optical Telescope (DOT), Aryabhatta Research Institute of Observational Sciences (ARIES), Devasthal Observatory, during an observing run focused on M-dwarf stars. The visit, undertaken as Principal Investigator (PI) together with Ph.D. supervisor Dr. Soumen Mondal and telescope operators, provided hands-on experience with India's premier optical observing facility, advanced instrumentation, and professional nighttime observational operations.",
    shortCaption:
      "PI observing run on the 3.6-m DOT with Ph.D. supervisor and telescope operators.",
    institution: "ARIES",
    location: "Devasthal Observatory, Nainital, Uttarakhand",
    event: "3.6-m DOT Observing Run",
    stage: "Ph.D. Research",
    category: "facility",
    tags: ["DOT", "ARIES", "M-dwarf", "PI", "Observing Run", "Optical", "Devasthal"],
    facility: "3.6-m Devasthal Optical Telescope",
    topic: "M-dwarf stars",
    presentationType: "Observing Run",
    role: "Principal Investigator",
    featured: true,
    priority: 1,
    orientation: "portrait",
    alt: "Research team beside the 3.6-metre Devasthal Optical Telescope during an M-dwarf observing run.",
    relatedRoute: { to: "/facilities", label: "Research Facilities" },
  },
  {
    id: "dot-visit",
    filename: "research_facility_aries_devasthal_dot_36m_visit_02.jpg",
    src: r29.url,
    title: "3.6-m Devasthal Optical Telescope",
    caption:
      "Visiting the 3.6-meter Devasthal Optical Telescope (DOT) at the Devasthal Observatory, operated by the Aryabhatta Research Institute of Observational Sciences (ARIES), Nainital. As the Principal Investigator (PI) of an observing proposal focused on M-dwarf stars, this visit provided direct experience with India's largest optical telescope, its advanced instrumentation, and professional observational facilities supporting front-line astronomical research.",
    shortCaption:
      "PI of an M-dwarf observing proposal on India's largest optical telescope.",
    institution: "ARIES",
    location: "Devasthal Observatory, Nainital, Uttarakhand",
    event: "3.6-m DOT Visit",
    stage: "Ph.D. Research",
    category: "facility",
    tags: ["DOT", "ARIES", "M-dwarf", "PI", "Optical", "Devasthal"],
    facility: "3.6-m Devasthal Optical Telescope",
    topic: "M-dwarf stars",
    presentationType: "Facility Visit",
    role: "Principal Investigator",
    featured: true,
    priority: 2,
    orientation: "portrait",
    alt: "Standing beneath the mount of the 3.6-metre Devasthal Optical Telescope inside the DOT dome.",
    relatedRoute: { to: "/facilities", label: "Research Facilities" },
  },
  {
    id: "dfot-visit",
    filename: "research_facility_aries_devasthal_dfot_13m_visit_01.jpg",
    src: r27.url,
    title: "1.3-m DFOT — Facility Visit",
    caption:
      "Visiting the 1.3-m Devasthal Fast Optical Telescope (DFOT) at the Devasthal Observatory, operated by the Aryabhatta Research Institute of Observational Sciences (ARIES), Nainital. The visit provided first-hand exposure to a modern 1.3-meter Ritchey–Chrétien Cassegrain optical telescope, offering valuable insight into professional observational astronomy, telescope instrumentation, and the facilities supporting contemporary astrophysical research.",
    shortCaption:
      "Facility visit to the 1.3-m DFOT — a Ritchey–Chrétien Cassegrain optical telescope.",
    institution: "ARIES",
    location: "Devasthal Observatory, Nainital, Uttarakhand",
    event: "1.3-m DFOT Visit",
    stage: "Ph.D. Research",
    category: "facility",
    tags: ["DFOT", "ARIES", "Optical", "Devasthal", "Ritchey–Chrétien"],
    facility: "1.3-m Devasthal Fast Optical Telescope",
    presentationType: "Facility Visit",
    featured: true,
    priority: 3,
    orientation: "portrait",
    alt: "Beside the yellow-painted 1.3-metre Devasthal Fast Optical Telescope at ARIES.",
    relatedRoute: { to: "/facilities", label: "Research Facilities" },
  },
  {
    id: "asi-2022-poster",
    filename: "conference_asi_2022_poster_presentation_m_dwarf_spectroscopy_01.jpg",
    src: cf13.url,
    title: "ASI 2022 — M-dwarf Spectroscopy Poster",
    caption:
      "Presenting the research poster \"Magnetic Activity of M-dwarfs: Optical and Near-Infrared Spectroscopic Studies\" during the Astronomical Society of India (ASI) Meeting 2022, jointly hosted by IIT Roorkee and ARIES, highlighting optical and near-infrared spectroscopic investigations of magnetically active M-dwarf stars.",
    shortCaption:
      "Poster on optical and NIR spectroscopy of magnetically active M-dwarfs.",
    year: 2022,
    institution: "IIT Roorkee & ARIES",
    location: "IIT Roorkee, India",
    event: "ASI Meeting 2022",
    eventSeries: "ASI 2022",
    stage: "Ph.D. Research",
    category: "poster",
    tags: ["ASI", "Poster", "M-dwarf", "Spectroscopy", "NIR", "Optical", "2022"],
    topic: "Magnetic activity of M-dwarfs",
    presentationType: "Poster Presentation",
    featured: true,
    priority: 4,
    orientation: "portrait",
    alt: "Standing next to a research poster on M-dwarf spectroscopy at the ASI 2022 meeting.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "asi-2022-group",
    filename: "conference_asi_2022_group_photo_02.jpg",
    src: cf12.url,
    title: "ASI 2022 — Official Group Photograph",
    caption:
      "Official group photograph of participants during the Astronomical Society of India (ASI) Meeting 2022, jointly hosted by IIT Roorkee and ARIES at the IIT Roorkee campus, bringing together researchers, students, and faculty from astronomy and astrophysics institutions across India.",
    shortCaption:
      "Participants of the ASI 2022 Meeting at IIT Roorkee.",
    year: 2022,
    institution: "IIT Roorkee & ARIES",
    location: "IIT Roorkee, India",
    event: "ASI Meeting 2022",
    eventSeries: "ASI 2022",
    category: "participation",
    tags: ["ASI", "Group Photograph", "2022", "IIT Roorkee"],
    presentationType: "Group Photograph",
    priority: 20,
    orientation: "landscape",
    alt: "Official group photograph of the ASI 2022 meeting participants at IIT Roorkee.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "bosefest-2023-oral-01",
    filename: "conference_bose_fest_2023_oral_presentation_01.jpg",
    src: cf17.url,
    title: "Bose Fest 2023 — Optical Spectra (DOT / TANSPEC)",
    caption:
      "Presenting optical spectroscopic results of M-dwarf stars during Bose Fest 2023.",
    shortCaption: "Presenting M-dwarf optical spectra from DOT/TANSPEC.",
    year: 2023,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2023",
    eventSeries: "Bose Fest 2023",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "M-dwarf", "Spectroscopy", "DOT", "2023"],
    topic: "Optical spectroscopy of M-dwarfs",
    presentationType: "Oral Presentation",
    priority: 10,
    orientation: "landscape",
    alt: "Delivering an oral presentation showing DOT/TANSPEC optical spectra at Bose Fest 2023.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "bosefest-2023-oral-02",
    filename: "conference_bose_fest_2023_oral_presentation_02.jpg",
    src: cf18.url,
    title: "Bose Fest 2023 — What is an M-dwarf?",
    caption:
      "Explaining the fundamental properties and classification of M-dwarf stars during the oral presentation at Bose Fest 2023.",
    shortCaption: "Explaining the fundamental properties of M-dwarf stars.",
    year: 2023,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2023",
    eventSeries: "Bose Fest 2023",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "M-dwarf", "2023"],
    topic: "M-dwarf fundamentals",
    presentationType: "Oral Presentation",
    priority: 11,
    orientation: "landscape",
    alt: "Presenting an M-dwarf overview slide during Bose Fest 2023.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "bosefest-2023-oral-03",
    filename: "conference_bose_fest_2023_oral_presentation_03.jpg",
    src: cf19.url,
    title: "Bose Fest 2023 — Scientific Motivation",
    caption:
      "Introducing the scientific motivation and fundamental properties of M-dwarf stars during the oral presentation at Bose Fest 2023.",
    shortCaption: "Introducing the scientific motivation for M-dwarf research.",
    year: 2023,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2023",
    eventSeries: "Bose Fest 2023",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "M-dwarf", "2023"],
    topic: "M-dwarf motivation",
    presentationType: "Oral Presentation",
    priority: 12,
    orientation: "landscape",
    alt: "Introducing the motivation for M-dwarf research during Bose Fest 2023.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "bosefest-2023-facilities-01",
    filename: "conference_bose_fest_2023_observational_facilities_presentation_01.jpg",
    src: cf15.url,
    title: "Bose Fest 2023 — Observational Facilities",
    caption:
      "Presenting the observational facilities used in the research, including the Hanle/Leh-Chandra Telescope and the 1.3-m Devasthal Optical Telescope, during the Bose Fest 2023 oral presentation.",
    shortCaption:
      "Introducing the Hanle/Leh Chandra Telescope and 1.3-m DOT.",
    year: 2023,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2023",
    eventSeries: "Bose Fest 2023",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "Facilities", "HCT", "DOT", "2023"],
    topic: "Observational facilities",
    presentationType: "Oral Presentation",
    priority: 13,
    orientation: "landscape",
    alt: "Presenting a slide describing the observational telescope facilities at Bose Fest 2023.",
    relatedRoute: { to: "/facilities", label: "Research Facilities" },
  },
  {
    id: "bosefest-2023-facilities-02",
    filename: "conference_bose_fest_2023_observational_facilities_presentation_02.jpg",
    src: cf16.url,
    title: "Bose Fest 2023 — Telescope Infrastructure",
    caption:
      "Discussing the major observational facilities and telescope infrastructure employed in the research during the Bose Fest 2023 oral presentation.",
    shortCaption:
      "Discussing major telescope infrastructure used in the research.",
    year: 2023,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2023",
    eventSeries: "Bose Fest 2023",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "Facilities", "2023"],
    presentationType: "Oral Presentation",
    priority: 14,
    orientation: "landscape",
    alt: "Discussing observational facilities during the Bose Fest 2023 oral presentation.",
    relatedRoute: { to: "/facilities", label: "Research Facilities" },
  },
  {
    id: "bosefest-2024-poster-adleo",
    filename: "conference_bose_fest_2024_poster_presentation_ad_leonis_01.jpg",
    src: cf20.url,
    title: "Bose Fest 2024 — AD Leonis Poster",
    caption:
      "Research poster presentation at BOSE FEST 2024 featuring the study \"Stellar Activity and Probable Star–Planet Interaction in AD Leonis\", showcasing multi-wavelength investigations of magnetically active M-dwarf stars.",
    shortCaption:
      "Poster on stellar activity and probable star–planet interaction in AD Leonis.",
    year: 2024,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2024",
    eventSeries: "Bose Fest 2024",
    stage: "Ph.D. Research",
    category: "poster",
    tags: ["Bose Fest", "Poster", "AD Leonis", "Star-Planet", "Multi-wavelength", "2024"],
    topic: "Stellar activity of AD Leonis",
    presentationType: "Poster Presentation",
    featured: true,
    priority: 5,
    orientation: "landscape",
    alt: "Research poster on AD Leonis at Bose Fest 2024.",
    relatedRoute: { to: "/publications", label: "Publications" },
  },
  {
    id: "bosefest-2025-flare",
    filename: "conference_bose_fest_2025_oral_presentation_flare_energy_analysis_01.jpg",
    src: cf21.url,
    title: "Bose Fest 2025 — Flare Duration vs Energy",
    caption:
      "Presenting research findings at BOSE FEST 2025 on the correlation between stellar flare duration and flare energy, highlighting observational results for AD Leonis and Wolf 359.",
    shortCaption:
      "Oral talk on flare duration–energy correlations in AD Leo and Wolf 359.",
    year: 2025,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2025",
    eventSeries: "Bose Fest 2025",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "Flares", "AD Leonis", "Wolf 359", "2025"],
    topic: "Stellar flares",
    presentationType: "Oral Presentation",
    featured: true,
    priority: 6,
    orientation: "landscape",
    alt: "Presenting a flare duration–energy correlation slide at Bose Fest 2025.",
    relatedRoute: { to: "/publications", label: "Publications" },
  },
  {
    id: "bosefest-2025-starspots",
    filename: "conference_bose_fest_2025_oral_presentation_starspots_02.jpg",
    src: cf22.url,
    title: "Bose Fest 2025 — Starspots & BASSMAN",
    caption:
      "Delivering an oral presentation at BOSE FEST 2025, discussing starspot modelling, photometric observations, and computational analysis of magnetically active stars using the BASSMAN framework.",
    shortCaption: "Starspot modelling with the BASSMAN framework.",
    year: 2025,
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Bose Fest 2025",
    eventSeries: "Bose Fest 2025",
    stage: "Ph.D. Research",
    category: "oral",
    tags: ["Bose Fest", "Oral", "Starspots", "BASSMAN", "Wolf 359", "2025"],
    topic: "Starspot modelling",
    presentationType: "Oral Presentation",
    priority: 15,
    orientation: "landscape",
    alt: "Presenting a starspot modelling slide with the BASSMAN framework at Bose Fest 2025.",
    relatedRoute: { to: "/research", label: "Research Areas" },
  },
  {
    id: "nsss-2024-poster",
    filename: "conference_nsss_2024_poster_presentation_ad_leonis_01.jpg",
    src: cf23.url,
    title: "NSSS 2024 — AD Leonis Poster",
    caption:
      "Presenting the research poster \"Stellar Activity and Probable Star–Planet Interaction in AD Leonis\" during the 22nd National Space Science Symposium (NSSS 2024) at Goa University, showcasing multi-wavelength investigations of magnetically active M-dwarf stars.",
    shortCaption:
      "Poster on AD Leonis at the 22nd National Space Science Symposium.",
    year: 2024,
    institution: "Goa University (with ISRO)",
    location: "Goa",
    event: "NSSS 2024 — 22nd National Space Science Symposium",
    eventSeries: "NSSS 2024",
    stage: "Ph.D. Research",
    category: "poster",
    tags: ["NSSS", "Poster", "AD Leonis", "ISRO", "Goa", "2024"],
    topic: "Stellar activity of AD Leonis",
    presentationType: "Poster Presentation",
    featured: true,
    priority: 7,
    orientation: "portrait",
    alt: "Standing beside the AD Leonis poster at the NSSS 2024 poster session.",
    relatedRoute: { to: "/publications", label: "Publications" },
  },
  {
    id: "nsss-2024-participation",
    filename: "conference_nsss_2024_symposium_participation_02.jpg",
    src: cf24.url,
    title: "NSSS 2024 — Symposium Participation",
    caption:
      "Participating in the 22nd National Space Science Symposium (NSSS 2024) at Goa University, an event organized in collaboration with the Indian Space Research Organisation (ISRO), bringing together researchers in astronomy and astrophysics.",
    shortCaption: "Participation at NSSS 2024 at Goa University with ISRO.",
    year: 2024,
    institution: "Goa University (with ISRO)",
    location: "Goa",
    event: "NSSS 2024",
    eventSeries: "NSSS 2024",
    category: "participation",
    tags: ["NSSS", "Participation", "ISRO", "Goa", "2024"],
    presentationType: "Participation",
    priority: 21,
    orientation: "portrait",
    alt: "Beside the NSSS 2024 poster session signage at Goa University.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "starformation-2024-team",
    filename: "conference_star_formation_2024_research_team_group_photo_02.jpg",
    src: cf25.url,
    title: "Star Formation Conference 2024 — Research Team",
    caption:
      "Group photograph during the Star Formation Conference 2024 at S. N. Bose National Centre for Basic Sciences, Kolkata, with Ph.D. supervisor Dr. Soumen Mandal and fellow members of the Department of Astrophysics and Cosmology, reflecting the collaborative research environment fostered during the conference.",
    shortCaption:
      "Research team group photograph at Star Formation Conference 2024.",
    year: 2024,
    date: "January 8–11, 2024",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Star Formation Conference 2024",
    eventSeries: "Star Formation 2024",
    category: "participation",
    tags: ["Star Formation", "Group", "SNBNCBS", "Supervisor", "2024"],
    presentationType: "Group Photograph",
    priority: 22,
    orientation: "landscape",
    alt: "Group photograph of the research team at the Star Formation Conference 2024.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "starformation-2024-supervisor",
    filename: "conference_star_formation_2024_supervisor_and_collaborators_01.jpg",
    src: cf26.url,
    title: "Star Formation Conference 2024 — With Supervisor & Collaborators",
    caption:
      "Group photograph during the Star Formation Conference 2024 at S. N. Bose National Centre for Basic Sciences, Kolkata, with Ph.D. supervisor Dr. Soumen Mandal and research collaborators, celebrating scientific collaboration and academic exchange.",
    shortCaption:
      "With Ph.D. supervisor and collaborators at Star Formation Conference 2024.",
    year: 2024,
    date: "January 8–11, 2024",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Star Formation Conference 2024",
    eventSeries: "Star Formation 2024",
    category: "participation",
    tags: ["Star Formation", "Group", "Supervisor", "2024"],
    presentationType: "Group Photograph",
    priority: 23,
    orientation: "landscape",
    alt: "Diya with Ph.D. supervisor and research collaborators at the Star Formation Conference 2024.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "bina",
    filename: "conference_bina_group_photo_01.jpg",
    src: cf14.url,
    title: "BINA Conference — Group Photograph",
    caption:
      "Group photograph of conference participants during the BINA Conference.",
    shortCaption: "Group photograph at the BINA Conference.",
    event: "BINA Conference",
    eventSeries: "BINA",
    category: "participation",
    tags: ["BINA", "Group Photograph"],
    presentationType: "Group Photograph",
    priority: 24,
    orientation: "landscape",
    alt: "Group photograph of participants at the BINA Conference.",
    relatedRoute: { to: "/conferences", label: "Conferences & Presentations" },
  },
  {
    id: "phd-thesis-5000",
    filename: "academic_phd_5000_word_thesis_submission_presentation_01.jpg",
    src: a06.url,
    title: "Ph.D. — 5000-Word Thesis Presentation",
    caption:
      "Delivering the 5000-word Ph.D. thesis submission presentation at S. N. Bose National Centre for Basic Sciences, Kolkata, on 29 August 2025, marking an important doctoral research milestone alongside fellow researcher Rajib Kumbhakar.",
    shortCaption:
      "Doctoral milestone: 5000-word thesis submission presentation.",
    year: 2025,
    date: "29 August 2025",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Ph.D. Thesis Submission Presentation",
    eventSeries: "Ph.D. Milestones",
    stage: "Ph.D. Milestones",
    category: "milestone",
    tags: ["Thesis", "Milestone", "Ph.D.", "SNBNCBS", "2025"],
    presentationType: "Thesis Milestone",
    featured: true,
    priority: 8,
    orientation: "landscape",
    alt: "Delivering the 5000-word Ph.D. thesis submission presentation at SNBNCBS.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "phd-thesis-hardcopy",
    filename: "academic_phd_final_hard_copy_thesis_submission_university_of_calcutta_02.jpg",
    src: a07.url,
    title: "Ph.D. — Final Hard-Copy Thesis Submission",
    caption:
      "Submission of the final hard copy of the Ph.D. thesis to the University of Calcutta on 9 July 2026, marking the successful completion of a major doctoral milestone before the thesis evaluation and defense process.",
    shortCaption:
      "Doctoral milestone: final hard-copy thesis submission at the University of Calcutta.",
    year: 2026,
    date: "9 July 2026",
    institution: "University of Calcutta",
    location: "Kolkata",
    event: "Final Hard-Copy Thesis Submission",
    eventSeries: "Ph.D. Milestones",
    stage: "Ph.D. Milestones",
    category: "milestone",
    tags: ["Thesis", "Milestone", "Ph.D.", "University of Calcutta", "2026"],
    presentationType: "Thesis Milestone",
    featured: true,
    priority: 9,
    orientation: "portrait",
    alt: "Standing outside the Ph.D. section at the University of Calcutta with the final hard-copy thesis.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "msc-moon",
    filename: "academic_msc_astrophysics_moon_observation_14inch_telescope_01.jpg",
    src: a04.url,
    title: "M.Sc. — Moon through a 14-inch Telescope",
    caption:
      "Observing the Moon through a 14-inch telescope during an observational astronomy session at St. Xavier's College, Kolkata, as part of the M.Sc. Physics (Astrophysics) programme. The session provided practical experience in telescope operation, astronomical observation, and observational techniques fundamental to astrophysical research.",
    shortCaption:
      "Observing the Moon through a 14-inch telescope at St. Xavier's College.",
    institution: "St. Xavier's College, Kolkata",
    location: "Kolkata",
    event: "M.Sc. Observatory Session",
    eventSeries: "M.Sc. Astrophysics",
    stage: "M.Sc. Astrophysics",
    category: "academic",
    tags: ["M.Sc.", "Telescope", "Moon", "St. Xavier's", "Observatory"],
    facility: "14-inch Telescope",
    presentationType: "Facility Visit",
    priority: 30,
    orientation: "portrait",
    alt: "Observing the Moon through a 14-inch telescope at St. Xavier's College, Kolkata.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "msc-sports",
    filename: "academic_msc_astrophysics_annual_sports_day_group_photo_02.jpg",
    src: a03.url,
    title: "M.Sc. — Annual Sports Day",
    caption:
      "Group photograph with classmates representing the M.Sc. Physics programme during the Annual Sports Day at St. Xavier's College, Kolkata, celebrating friendship, teamwork, and memorable moments beyond the classroom.",
    shortCaption:
      "With M.Sc. Physics classmates at the St. Xavier's Annual Sports Day.",
    institution: "St. Xavier's College, Kolkata",
    location: "Kolkata",
    event: "Annual Sports Day",
    eventSeries: "M.Sc. Astrophysics",
    stage: "M.Sc. Astrophysics",
    category: "academic",
    tags: ["M.Sc.", "St. Xavier's", "Community"],
    presentationType: "Group Photograph",
    priority: 31,
    orientation: "landscape",
    alt: "Group photograph with M.Sc. Physics classmates at St. Xavier's Annual Sports Day.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "msc-xavotsav",
    filename: "academic_msc_astrophysics_xavotsav_group_photo_03.jpg",
    src: a05.url,
    title: "M.Sc. — Xavotsav Festival",
    caption:
      "Group photograph with classmates during Xavotsav, the premier annual inter-college cultural festival of St. Xavier's College (Autonomous), Kolkata, celebrating student life, cultural diversity, and memorable moments shared beyond academics throughout the M.Sc. Physics journey.",
    shortCaption:
      "With M.Sc. classmates during Xavotsav at St. Xavier's College.",
    institution: "St. Xavier's College, Kolkata",
    location: "Kolkata",
    event: "Xavotsav",
    eventSeries: "M.Sc. Astrophysics",
    stage: "M.Sc. Astrophysics",
    category: "academic",
    tags: ["M.Sc.", "St. Xavier's", "Community"],
    presentationType: "Group Photograph",
    priority: 32,
    orientation: "landscape",
    alt: "Group photograph with M.Sc. classmates during Xavotsav at St. Xavier's College.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "bsc-study",
    filename: "academic_bsc_physics_honours_batchmates_study_session_01.jpg",
    src: a01.url,
    title: "B.Sc. — Study Session with Batchmates",
    caption:
      "Group photograph with Sandipani Tribedi and other classmates during the B.Sc. Physics (Honours) programme at Banagabasi Morning College, University of Calcutta, capturing moments of collaborative learning, academic discussions, and friendships that shaped the undergraduate journey.",
    shortCaption:
      "Collaborative study session during the B.Sc. Physics (Honours) programme.",
    institution: "Banagabasi Morning College, University of Calcutta",
    location: "Kolkata",
    event: "B.Sc. Study Session",
    eventSeries: "B.Sc. Physics",
    stage: "B.Sc. Physics (Honours)",
    category: "academic",
    tags: ["B.Sc.", "Banagabasi", "University of Calcutta", "Community"],
    presentationType: "Group Photograph",
    priority: 33,
    orientation: "landscape",
    alt: "Group photograph with B.Sc. Physics batchmates during a study session.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "bsc-light-lab",
    filename: "academic_bsc_physics_honours_light_practical_lab_02.jpg",
    src: a02.url,
    title: "B.Sc. — Light Practical Laboratory",
    caption:
      "Conducting a hands-on optics experiment in the Light Practical Laboratory during the B.Sc. Physics (Honours) programme at Banagabasi Morning College, University of Calcutta, while a fellow batchmate observes the procedure—reflecting practical training in optical alignment, measurement, and experimental physics.",
    shortCaption: "Hands-on optics experiment in the Light Practical Laboratory.",
    institution: "Banagabasi Morning College, University of Calcutta",
    location: "Kolkata",
    event: "B.Sc. Practical Lab",
    eventSeries: "B.Sc. Physics",
    stage: "B.Sc. Physics (Honours)",
    category: "academic",
    tags: ["B.Sc.", "Optics", "Laboratory", "Banagabasi"],
    presentationType: "Facility Visit",
    priority: 34,
    orientation: "portrait",
    alt: "Conducting a hands-on optics experiment at the Light Practical Laboratory.",
    relatedRoute: { to: "/academic-journey", label: "Academic Journey" },
  },
  {
    id: "teachers-day-cake",
    filename: "campus_teachers_day_celebration_cake_cutting_02.jpg",
    src: c08.url,
    title: "Teacher's Day — Cake-Cutting Ceremony",
    caption:
      "Cake-cutting ceremony during the Teacher's Day Celebration at S. N. Bose National Centre for Basic Sciences, Kolkata, bringing together Ph.D. supervisors, research scholars, and fellow researchers in appreciation of mentorship and academic guidance.",
    shortCaption:
      "Cake-cutting during Teacher's Day at SNBNCBS.",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Teacher's Day Celebration",
    eventSeries: "Teacher's Day",
    stage: "Research Community",
    category: "community",
    tags: ["Teacher's Day", "SNBNCBS", "Community"],
    presentationType: "Community",
    priority: 40,
    orientation: "landscape",
    alt: "Cake-cutting ceremony during Teacher's Day at SNBNCBS.",
    relatedRoute: { to: "/about", label: "About" },
  },
  {
    id: "teachers-day-faculty",
    filename: "campus_teachers_day_celebration_faculty_and_researchers_01.jpg",
    src: c09.url,
    title: "Teacher's Day — Faculty & Researchers",
    caption:
      "Group gathering during the Teacher's Day Celebration at S. N. Bose National Centre for Basic Sciences, Kolkata, bringing together Ph.D. supervisors, research scholars, and fellow researchers to celebrate mentorship, academic excellence, and the strong research community beyond the laboratory.",
    shortCaption:
      "Faculty and researchers gathered for Teacher's Day at SNBNCBS.",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Teacher's Day Celebration",
    eventSeries: "Teacher's Day",
    stage: "Research Community",
    category: "community",
    tags: ["Teacher's Day", "SNBNCBS", "Community"],
    presentationType: "Community",
    priority: 41,
    orientation: "landscape",
    alt: "Faculty and researchers gathered for Teacher's Day at SNBNCBS.",
    relatedRoute: { to: "/about", label: "About" },
  },
  {
    id: "teachers-day-group",
    filename: "campus_teachers_day_celebration_group_photo_03.jpg",
    src: c10.url,
    title: "Teacher's Day — Group Photograph",
    caption:
      "Group photograph with Ph.D. supervisors, research scholars, and fellow researchers during the Teacher's Day Celebration at S. N. Bose National Centre for Basic Sciences, Kolkata, commemorating the occasion through shared moments of gratitude, collaboration, and academic fellowship.",
    shortCaption:
      "Group photograph during Teacher's Day at SNBNCBS.",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Teacher's Day Celebration",
    eventSeries: "Teacher's Day",
    stage: "Research Community",
    category: "community",
    tags: ["Teacher's Day", "SNBNCBS", "Community"],
    presentationType: "Community",
    priority: 42,
    orientation: "landscape",
    alt: "Group photograph during Teacher's Day at SNBNCBS.",
    relatedRoute: { to: "/about", label: "About" },
  },
  {
    id: "teachers-day-outdoor",
    filename: "campus_teachers_day_celebration_outdoor_group_photo_04.jpg",
    src: c11.url,
    title: "Teacher's Day — Outdoor Group Photograph",
    caption:
      "Outdoor group photograph during the Teacher's Day Celebration at S. N. Bose National Centre for Basic Sciences, Kolkata, with Ph.D. supervisors, research scholars, and fellow researchers, celebrating mentorship, collaboration, and the vibrant academic community beyond the laboratory.",
    shortCaption:
      "Outdoor group photograph during Teacher's Day at SNBNCBS.",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata",
    event: "Teacher's Day Celebration",
    eventSeries: "Teacher's Day",
    stage: "Research Community",
    category: "community",
    tags: ["Teacher's Day", "SNBNCBS", "Community"],
    presentationType: "Community",
    priority: 43,
    orientation: "landscape",
    alt: "Outdoor group photograph during Teacher's Day at SNBNCBS.",
    relatedRoute: { to: "/about", label: "About" },
  },
];

// Small derived helpers used by the Gallery route.
export const galleryTotalCount = gallery.length;

export const galleryYearRange = (() => {
  const years = gallery.map((g) => g.year).filter((y): y is number => typeof y === "number");
  return { min: Math.min(...years), max: Math.max(...years) };
})();

export const galleryStats = {
  total: gallery.length,
  facilities: gallery.filter((g) => g.category === "facility").length,
  oral: gallery.filter((g) => g.category === "oral").length,
  poster: gallery.filter((g) => g.category === "poster").length,
  participation: gallery.filter((g) => g.category === "participation").length,
  milestones: gallery.filter((g) => g.category === "milestone").length,
  academic: gallery.filter((g) => g.category === "academic").length,
  community: gallery.filter((g) => g.category === "community").length,
  conferenceEvents: new Set(
    gallery.filter((g) => g.eventSeries && g.category !== "academic" && g.category !== "community" && g.category !== "milestone").map((g) => g.eventSeries),
  ).size,
  locations: new Set(gallery.map((g) => g.location).filter(Boolean)).size,
  institutions: new Set(gallery.map((g) => g.institution).filter(Boolean)).size,
};

export const galleryCategories: { id: GalleryCategory | "all" | "featured"; label: string }[] = [
  { id: "all", label: "All Records" },
  { id: "featured", label: "Featured" },
  { id: "facility", label: "Research Facilities" },
  { id: "oral", label: "Oral Presentations" },
  { id: "poster", label: "Poster Presentations" },
  { id: "participation", label: "Conferences" },
  { id: "milestone", label: "Milestones" },
  { id: "academic", label: "Academic Journey" },
  { id: "community", label: "Research Community" },
];

export const galleryYears = Array.from(
  new Set(gallery.map((g) => g.year).filter((y): y is number => typeof y === "number")),
).sort((a, b) => b - a);

export const galleryEventSeries = Array.from(
  new Set(gallery.map((g) => g.eventSeries).filter((s): s is string => typeof s === "string")),
);

export type GalleryEventGroup = {
  series: string;
  count: number;
  records: GalleryRecord[];
  year?: number;
  event?: string;
};

export const galleryByEventSeries: GalleryEventGroup[] = galleryEventSeries
  .map((series) => {
    const records = gallery.filter((g) => g.eventSeries === series);
    return {
      series,
      count: records.length,
      records,
      year: records.find((r) => r.year)?.year,
      event: records[0].event,
    };
  })
  .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
