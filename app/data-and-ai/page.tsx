import { LegalPage, LSection } from "@/components/LegalPage";
import { BadgeCheck } from "lucide-react";

export const metadata = {
  title: "Source of Data & AI",
  description: "Where every number in Palatify comes from, and how our AI works.",
};

// Palatify's answer to the industry-standard "source of data" page — with the
// things most apps leave out: per-value provenance, named AI providers,
// uncertainty labeling, and a correction policy.

export default function DataAndAiPage() {
  return (
    <LegalPage kicker="Transparency" title="Source of Data & AI" updated="July 19, 2026">
      <p>
        Palatify does not provide medical advice, clinical guidance, or treatment plans.
        Everything in the app is general nutrition information for educational and
        decision-support purposes. It is not intended to diagnose, treat, cure, or
        prevent any condition, and it never substitutes for a physician or registered
        dietitian. Palatify makes no disease-related claims and is not marketed for
        medical use.
      </p>

      <LSection title="Where every nutrition number comes from">
        <p>
          Unlike most nutrition apps, Palatify attaches a source to <em>every</em> value it
          shows, at one of three levels:
        </p>
        <p>
          <span className="inline-flex items-center gap-1 font-semibold text-ink"><BadgeCheck className="h-4 w-4 text-brand-600" /> Partner-verified</span> — reviewed
          and confirmed by the restaurant itself through our partner tools; corrections
          are versioned and never silent.
        </p>
        <p>
          <strong>Published</strong> — taken from the restaurant's own public nutrition
          disclosure (for example, chains that publish per-dish nutrition), with the
          retrieval date recorded.
        </p>
        <p>
          <strong>Estimated (±)</strong> — computed by our engine from the public menu,
          grounded against federal reference data (USDA FoodData Central), and always
          displayed with an uncertainty label. An estimate is never presented as an
          exact fact.
        </p>
        <p>
          Your personal targets are calculated with the Mifflin–St Jeor equation from
          the profile you provide — the same standard used across the fitness industry —
          and, once you have enough logged history, calibrated against your own observed
          energy balance. The app tells you when calibration is active and why.
        </p>
      </LSection>

      <LSection title="How our AI works — and its limits">
        <p>
          Two features use large language / vision models: the nutrition coach chat and
          photo meal estimation. Requests are processed server-side by our AI providers —
          currently the DataRobot LLM Gateway, Google Gemini, and Groq — and the app
          shows which provider answered. Your chat text or meal photo, plus your targets
          if you're signed in, is sent to generate the response; we don't use it to train
          models and never for advertising.
        </p>
        <p>
          AI estimates are uncertain by nature, so Palatify treats them accordingly:
          photo estimates show a confidence level, every value is editable before it
          reaches your log, and your corrections are kept. If all providers fail, the
          app says so — it never invents a number to fill silence. The coach will not
          diagnose, prescribe, or advise on medication, and will point you to a
          clinician for medical questions.
        </p>
      </LSection>

      <LSection title="Allergies — read this">
        <p>
          Allergen and condition notices are generated from menu text and your profile.
          They are advisories, not guarantees: menu descriptions are incomplete and
          kitchens change. <strong>Always confirm allergens directly with the restaurant
          before ordering.</strong> When you order through Palatify, your flagged allergens
          are passed to the restaurant with the order — but that transmission also does
          not replace direct confirmation.
        </p>
      </LSection>

      <LSection title="Reference data">
        <p>
          Population-health context cited in the app comes from public federal sources:
          CDC obesity surveillance (BRFSS, NCHS), USDA Economic Research Service food
          expenditure data, and USDA FoodData Central for nutrient references. Links
          appear in the footer and on the Impact page. Restaurant names and brands
          remain the property of their owners; references are for identification only.
        </p>
      </LSection>

      <LSection title="Corrections">
        <p>
          Found a wrong number? Restaurants can correct their menus through the partner
          tools; diners can flag values in the app or email{" "}
          <a className="font-semibold text-brand-700 underline" href="mailto:support@prosperiumars.com">support@prosperiumars.com</a>.
          Corrections are versioned with what changed and when — never applied silently.
        </p>
      </LSection>
    </LegalPage>
  );
}
