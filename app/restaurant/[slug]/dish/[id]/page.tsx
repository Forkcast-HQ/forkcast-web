import { fetchCatalog } from "@/lib/catalog";
import { RESTAURANTS } from "@/data/restaurants";
import { DishDetail } from "@/components/DishDetail";

export async function generateStaticParams() {
  const liveRestaurants = await fetchCatalog();
  const restaurants = liveRestaurants.length ? liveRestaurants : RESTAURANTS;
  return restaurants.flatMap((r) => r.menu.map((m) => ({ slug: r.slug, id: m.id })));
}

// See app/restaurant/[slug]/page.tsx for why this must be a literal.
export const dynamicParams = true;

export default async function DishPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <DishDetail slug={slug} id={id} />;
}
