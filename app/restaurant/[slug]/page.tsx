import { RESTAURANTS } from "@/data/restaurants";
import { RestaurantDetail } from "@/components/RestaurantDetail";

export function generateStaticParams() {
  return RESTAURANTS.map((r) => ({ slug: r.slug }));
}

export const dynamicParams = false;

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RestaurantDetail slug={slug} />;
}
