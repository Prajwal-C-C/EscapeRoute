import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PlaceholderPage
      title={`Itinerary ${id}`}
      description="This route is ready for the day-by-day trip plan, optimized route map, places, restaurants, and timing details."
    />
  );
}
