import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy compatibility: the personal chronicle used to live at /news/<slug>.
 * Those entries now live under /mission-log/<slug>, so redirect permanently
 * rather than 404 on shared or indexed links.
 */
export const Route = createFileRoute("/news/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/mission-log/$slug", params: { slug: params.slug }, replace: true });
  },
});
