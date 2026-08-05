import { fetchCatalog } from "@/lib/catalog";
import { RESTAURANTS } from "@/data/restaurants";
import { RestaurantDetail } from "@/components/RestaurantDetail";

export async function generateStaticParams() {
  const liveRestaurants = await fetchCatalog();
  const restaurants = liveRestaurants.length ? liveRestaurants : RESTAURANTS;
  return restaurants.map((r) => ({ slug: r.slug }));
}

// Must be a static literal (Next.js parses this without executing the
// module), so it can't branch on STATIC_EXPORT directly. `true` lets the
// normal SSR build (Vercel/Netlify) render any published slug on demand,
// including ones added after the last build — e.g. a restaurant that just
// self-serve published. The static-export (GitHub Pages) build has no
// server to render on demand regardless of this flag, so it's a no-op
// there: only the generateStaticParams slugs above ever get emitted.
export const dynamicParams = true;

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RestaurantDetail slug={slug} />;
}
