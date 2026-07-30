export { default } from "@/components/PassthroughLayout";

/**
 * The template is repeated here on purpose. Setting `title` to a plain
 * string in an intermediate layout replaces the entire title field for that
 * subtree — template included — so /partner/onboarding was rendering as
 * "List your restaurant" with no brand on the end. `template` covers the
 * children; `default` stays bare because the ROOT template still applies to
 * it, and spelling the brand out here produced "… · Palatify · Palatify".
 */
export const metadata = {
  title: { default: "Partner terminal", template: "%s · Palatify" },
  // Behind sign-in and specific to one account — nothing to index.
  robots: { index: false, follow: false },
};
