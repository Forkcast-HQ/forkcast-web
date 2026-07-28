// Shared shell for policy/info pages (/privacy, /terms, /data-and-ai).
// These are the hosted URLs required by Google Play and the App Store; the
// mobile app renders the same content in its Settings section.

export function LegalPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="text-sm font-bold uppercase tracking-widest text-brand-600">{kicker}</span>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink/50">Last updated: {updated} · Applies to the Palatify web app and mobile apps.</p>
      <div className="prose-palatify mt-8 space-y-4 text-[15px] leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}

export function LSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-4">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
