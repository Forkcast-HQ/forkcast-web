import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-white">
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
              ["Membership & pricing", "/pricing"],
              ["Your dashboard", "/dashboard"],
              ["Set up profile", "/onboarding"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["For restaurants", "/for-restaurants"],
              ["Partner terminal (demo)", "/partner"],
              ["Impact & evidence", "/impact"],
              ["The opportunity", "/business"],
              ["Architecture", "/how-it-works#architecture"],
            ]}
          />
          <FooterCol
            title="Built on real data"
            links={[
              ["Source of Data & AI", "/data-and-ai"],
              ["CDC obesity facts", "https://www.cdc.gov/obesity/adult-obesity-facts/index.html"],
              ["USDA ERS food spending", "https://www.ers.usda.gov/data-products/food-expenditure-series/"],
              ["USDA FoodData Central", "https://fdc.nal.usda.gov/"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink/50 sm:flex-row sm:items-center">
          <p>
            © {2026} Palatify — demonstration prototype. Nutrition values are realistic estimates. ·{" "}
            <Link href="/pricing" className="hover:text-brand-700">Pricing</Link> ·{" "}
            <Link href="/privacy" className="hover:text-brand-700">Privacy</Link> ·{" "}
            <Link href="/terms" className="hover:text-brand-700">Terms</Link>
          </p>
          <p>Boston, MA · Built for the Palatify pitch.</p>
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
