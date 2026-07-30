/**
 * A layout that renders its children and nothing else.
 *
 * Fifteen routes in this app are client components, and a client component
 * cannot export `metadata` — so every one of them was inheriting the home
 * page's title verbatim. `/pricing` and `/discover`, the two most
 * link-worthy pages here, both said "Palatify — Eat out. Stay on plan." in
 * the tab, the history entry and the search result.
 *
 * A server `layout.tsx` alongside the page fixes that, but Next requires a
 * default-exported component in every one. Re-exporting this keeps each of
 * those files to its metadata and one line:
 *
 *     export { default } from "@/components/PassthroughLayout";
 *     export const metadata = { title: "Pricing" };
 */
export default function PassthroughLayout({ children }: { children: React.ReactNode }) {
  return children;
}
