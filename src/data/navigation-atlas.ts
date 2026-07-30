// Typed source of truth for the human-readable Website Navigation Atlas (/sitemap).
// Every path below is verified against the real route files in src/routes.

import {
  Activity,
  BookOpen,
  Building2,
  CalendarDays,
  Contact,
  Download,
  FileText,
  FlaskConical,
  GraduationCap,
  Home,
  Images,
  Map,
  Newspaper,
  Orbit,
  Radar,
  ScrollText,
  Shield,
  Telescope,
  User,
  type LucideIcon,
} from "lucide-react";

export type AtlasNode = {
  to: string;
  label: string;
  descriptor: string;
  icon: LucideIcon;
};

export type AtlasBranch = {
  id: string;
  title: string;
  summary: string;
  nodes: AtlasNode[];
};

export const atlasRoot: AtlasNode = {
  to: "/",
  label: "Home",
  descriptor: "Begin the research journey",
  icon: Home,
};

export const atlasBranches: AtlasBranch[] = [
  {
    id: "about-journey",
    title: "About & Journey",
    summary: "Scientific identity and academic path",
    nodes: [
      { to: "/about", label: "About", descriptor: "Profile and scientific identity", icon: User },
      {
        to: "/academic-journey",
        label: "Academic Journey",
        descriptor: "Education, fellowships and milestones",
        icon: GraduationCap,
      },
    ],
  },
  {
    id: "research",
    title: "Research",
    summary: "Themes, projects and instruments",
    nodes: [
      {
        to: "/research-universe",
        label: "Research Universe",
        descriptor: "Interactive map of the research programme",
        icon: Orbit,
      },
      {
        to: "/research",
        label: "Research Areas",
        descriptor: "Core scientific themes",
        icon: FlaskConical,
      },
      {
        to: "/projects",
        label: "Research Projects",
        descriptor: "Active and completed investigations",
        icon: Radar,
      },
      {
        to: "/facilities",
        label: "Telescope Facilities",
        descriptor: "Observatories and instrumentation",
        icon: Telescope,
      },
    ],
  },
  {
    id: "scholarship",
    title: "Scholarship & Observations",
    summary: "Published record and observing work",
    nodes: [
      {
        to: "/publications",
        label: "Publications",
        descriptor: "Peer-reviewed research record",
        icon: BookOpen,
      },
      {
        to: "/observations",
        label: "Observations",
        descriptor: "From telescope data to discovery",
        icon: Building2,
      },
      {
        to: "/conferences",
        label: "Conferences & Presentations",
        descriptor: "Talks, posters and scientific meetings",
        icon: CalendarDays,
      },
    ],
  },
  {
    id: "more-connect",
    title: "More & Connect",
    summary: "Teaching, resources and enquiries",
    nodes: [
      {
        to: "/teaching",
        label: "Teaching & Mentoring",
        descriptor: "Courses, training and supervision",
        icon: GraduationCap,
      },
      {
        to: "/gallery",
        label: "Scientific Gallery",
        descriptor: "Photographic research archive",
        icon: Images,
      },
      {
        to: "/downloads",
        label: "Downloads",
        descriptor: "Public research resources",
        icon: Download,
      },
      {
        to: "/mission-log",
        label: "Scientific Mission Log",
        descriptor: "Personal research updates",
        icon: Activity,
      },
      {
        to: "/news",
        label: "Astrophysics News Hub",
        descriptor: "Wider astrophysics developments",
        icon: Newspaper,
      },
      {
        to: "/contact",
        label: "Contact",
        descriptor: "Academic and professional enquiries",
        icon: Contact,
      },
      {
        to: "/privacy",
        label: "Privacy Policy",
        descriptor: "Data handling, copyright and citation",
        icon: Shield,
      },
      {
        to: "/sitemap",
        label: "Website Sitemap",
        descriptor: "This navigation atlas",
        icon: Map,
      },
    ],
  },
];

export const atlasIcons = { FileText, ScrollText };
