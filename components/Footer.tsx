import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Bone, not white. The 6rem top margin is bone (the page ground), so a white
 * footer turned every page into dark section → bone stripe → white slab, and
 * the stripe read as a gap rather than as breathing room. Matching the ground
 * makes the margin disappear into it.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink/60">
              Know before you go. Palatify helps you eat out without losing the
              plot on your goals.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Discover restaurants", "/discover"],
              ["How it works", "/how-it-works"],
              ["Pricing", "/pricing"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["For restaurants", "/for-restaurants"],
              ["Impact & evidence", "/impact"],
              ["The opportunity", "/business"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Data & AI", "/data-and-ai"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink/10 pt-6 text-xs text-ink/50 sm:flex-row sm:items-center">
          {/* The estimate disclaimer stays. "Demonstration prototype" and
              "built for the pitch" were positioning and are gone, but people
              make eating decisions on these numbers — telling them the
              numbers are estimates is a consumer disclosure, not a hedge. */}
          <p>
            © {new Date().getFullYear()} Palatify. Nutrition values are estimates —
            confirm allergens with the restaurant.
          </p>
          <p>Boston, Massachusetts</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-ink/60 transition-colors hover:text-brand-700"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
