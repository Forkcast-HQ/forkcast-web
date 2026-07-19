import { LegalPage, LSection } from "@/components/LegalPage";

export const metadata = {
  title: "Terms and Conditions — Forkcast",
  description: "The terms that govern use of Forkcast.",
};

// DRAFT for legal review before store submission.

export default function TermsPage() {
  return (
    <LegalPage kicker="Legal" title="Terms and Conditions" updated="July 19, 2026">
      <p>
        These terms govern your use of the Forkcast web and mobile applications. By
        creating an account or using the apps you agree to them.
      </p>

      <LSection title="What Forkcast is — and is not">
        <p>
          Forkcast provides nutrition information, personalized targets, and decision
          support for restaurant dining. It is <strong>not medical advice</strong>: nothing in
          the app diagnoses, treats, cures, or prevents any condition, and the app is not
          a substitute for a physician or registered dietitian. Calorie and macro targets
          are computed with standard equations (Mifflin–St Jeor, with optional
          calibration from your own logs) from information you provide. Condition and
          allergen notices are advisories generated from menu text — they are{" "}
          <strong>not a safety guarantee</strong>. If you have a food allergy, always confirm
          directly with the restaurant before ordering. Consult a qualified clinician
          before acting on nutrition information if you have a medical condition.
        </p>
      </LSection>

      <LSection title="Accuracy and provenance of nutrition data">
        <p>
          Every nutrition value in Forkcast carries its source: verified by a partner
          restaurant, published by the restaurant, or estimated by our engine with an
          uncertainty label. Estimates are exactly that — estimates. Details:{" "}
          <a className="font-semibold text-brand-700 underline" href="/data-and-ai">Source of Data &amp; AI</a>.
          Restaurant menus, prices, and recipes change; we do not warrant that any value
          is current or exact.
        </p>
      </LSection>

      <LSection title="Ordering">
        <p>
          Where ordering is available, Forkcast transmits your order to the restaurant;
          the food transaction is between you and the restaurant. During the pilot,
          orders are labeled with their integration status in the app. Prices, taxes,
          and fees are shown before you place an order.
        </p>
      </LSection>

      <LSection title="Subscriptions">
        <p>
          Forkcast Premium ($4.99/month or $39.99/year, with a 7-day free trial) unlocks
          AI features beyond the free tier. On mobile, subscriptions are billed and
          managed through your app store account and renew automatically until cancelled
          in the store's subscription settings. Store refund policies apply.
        </p>
      </LSection>

      <LSection title="Your account and acceptable use">
        <p>
          You are responsible for the accuracy of the information you provide and for
          keeping your credentials secure. Do not misuse the service: no unauthorized
          access, scraping, reverse engineering of our data pipeline, reselling of data,
          or uploading unlawful content. Restaurant accounts must only claim listings
          they are authorized to manage; menu corrections are versioned and auditable.
        </p>
      </LSection>

      <LSection title="Intellectual property">
        <p>
          The Forkcast software, design, and content are ours or our licensors'.
          Restaurant names, logos, and brands belong to their respective owners and are
          used for identification only; no affiliation or endorsement is implied unless
          explicitly labeled. You retain rights to the content you submit (photos,
          notes) and grant us the license needed to operate the service.
        </p>
      </LSection>

      <LSection title="Disclaimers and limitation of liability">
        <p>
          The service is provided "as is" without warranties of any kind. To the maximum
          extent permitted by law, Forkcast is not liable for indirect, incidental, or
          consequential damages, or for decisions made in reliance on nutrition
          information in the app — including allergen advisories, which never replace
          confirmation with the restaurant.
        </p>
      </LSection>

      <LSection title="Termination, changes, governing law">
        <p>
          You may delete your account at any time in the app; we may suspend accounts
          that violate these terms. We may update these terms, flagging material changes
          in the app. These terms are governed by the laws of the Commonwealth of
          Massachusetts, USA.
        </p>
      </LSection>

      <LSection title="Contact">
        <p>
          Questions:{" "}
          <a className="font-semibold text-brand-700 underline" href="mailto:shasanov@seas.harvard.edu">shasanov@seas.harvard.edu</a>
        </p>
      </LSection>
    </LegalPage>
  );
}
