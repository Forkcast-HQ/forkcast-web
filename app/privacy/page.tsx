import { LegalPage, LSection } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy — Forkcast",
  description: "How Forkcast collects, uses, protects, and deletes your data.",
};

// DRAFT for legal review before store submission. Written to be accurate to
// the product as built (see /data-and-ai for the data-provenance model).

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Legal" title="Privacy Policy" updated="July 19, 2026">
      <p>
        Forkcast helps you choose, order, and log restaurant meals against your own
        nutrition targets. That requires health-related information, so we hold
        ourselves to a stricter standard than a typical app: we collect only what the
        product needs, we never sell or rent your data, we never use your health data
        for advertising, and you can export or delete everything, in the app, at any time.
      </p>

      <LSection title="What we collect, and why">
        <p>
          <strong>Account:</strong> name, email address, and account type (diner or
          restaurant) — to create and secure your account.
        </p>
        <p>
          <strong>Health profile (provided by you):</strong> sex, age, height, weight,
          activity level, goal, dietary preferences, allergens to avoid, and any
          self-reported conditions — used solely to compute your calorie/macro targets,
          personalize Fit Scores, and show advisory warnings. Conditions and allergens
          are optional.
        </p>
        <p>
          <strong>Activity in the app:</strong> meals you log, weight entries, and orders
          you place — this is your own record; it exists so the product can work and so
          you can see it.
        </p>
        <p>
          <strong>Meal photos:</strong> if you use photo logging, the photo is sent to an
          AI service to estimate nutrition (see below) and kept on your device; in the
          current version photos are not stored on our servers.
        </p>
        <p>
          <strong>Location:</strong> if you grant permission, your approximate location is
          used on your device to sort restaurants by distance. We do not store a location
          history on our servers.
        </p>
        <p>
          <strong>Usage statistics:</strong> aggregated, non-identifying counts (e.g.,
          daily active users, feature usage) to improve the product.
        </p>
      </LSection>

      <LSection title="AI processing">
        <p>
          When you use the coach chat or photo meal estimation, the content you submit
          (your message or photo, plus your nutrition targets if you are signed in) is
          processed by our AI service providers to generate the response. Our providers
          are listed on the <a className="font-semibold text-brand-700 underline" href="/data-and-ai">Source of Data &amp; AI</a> page.
          API keys and requests are handled server-side; your data is not used by us to
          train models, and we do not permit our providers to use it for advertising.
        </p>
      </LSection>

      <LSection title="Where your data lives and how it is protected">
        <p>
          Data is stored with our database provider (Supabase, hosted in the United
          States), encrypted in transit, with row-level security so each account can
          access only its own records. Access on our side is limited to designated
          personnel for support and operations. No method of storage or transmission is
          100% secure, but health data gets our most conservative handling.
        </p>
      </LSection>

      <LSection title="What we never do">
        <p>
          We do not sell, rent, or trade your personal information. We do not run
          third-party advertising, and your health data is never used for advertising of
          any kind. We disclose personal information only if required by law or legal
          process.
        </p>
      </LSection>

      <LSection title="Your rights and controls">
        <p>
          You can view and edit your profile in the app; export your data (profile,
          logs, weights, orders) on request; and <strong>delete your account and all
          associated data directly in the app</strong> (Profile → Membership → Delete
          account on mobile). Deletion is permanent. You can also opt out of any
          non-essential communication.
        </p>
      </LSection>

      <LSection title="Restaurants and third-party content">
        <p>
          All restaurant names, logos, and brands are the property of their respective
          owners. Forkcast is not affiliated with, endorsed by, or sponsored by any
          restaurant or brand unless a partnership is explicitly labeled in the app.
          Nutrition values carry their source with them: partner-verified, published by
          the restaurant, or estimated by our engine with an uncertainty label — see{" "}
          <a className="font-semibold text-brand-700 underline" href="/data-and-ai">Source of Data &amp; AI</a>.
        </p>
      </LSection>

      <LSection title="Children">
        <p>
          Forkcast is not directed to children under 13, and we do not knowingly collect
          personal information from them. If you believe a child has provided us
          information, contact us and we will delete it.
        </p>
      </LSection>

      <LSection title="Changes and contact">
        <p>
          We may update this policy; material changes will be flagged in the app and the
          date above updated. Questions or requests:{" "}
          <a className="font-semibold text-brand-700 underline" href="mailto:shasanov@seas.harvard.edu">shasanov@seas.harvard.edu</a>.
        </p>
      </LSection>
    </LegalPage>
  );
}
