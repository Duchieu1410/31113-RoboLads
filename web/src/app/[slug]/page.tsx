import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";

export default async function LegacySlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(ROUTES.BLOG_POST(slug));
}
