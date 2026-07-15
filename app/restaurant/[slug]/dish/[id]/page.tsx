import { RESTAURANTS } from "@/data/restaurants";
import { DishDetail } from "@/components/DishDetail";

export function generateStaticParams() {
  return RESTAURANTS.flatMap((r) => r.menu.map((m) => ({ slug: r.slug, id: m.id })));
}

export const dynamicParams = false;

export default async function DishPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <DishDetail slug={slug} id={id} />;
}
