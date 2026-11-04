import { getAllResources } from "@/lib/queries";
import { ResourcesClient } from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const resources = await getAllResources(category, tag);

  return (
    <ResourcesClient
      initialResources={resources}
      initialCategory={category}
      initialTag={tag}
    />
  );
}
