import { Logo } from "@/components/Logo";

export function ComingSoon() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4f0] px-6 text-[#17382d]">
      <div className="absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#dce9df] blur-3xl" />
      <div className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#eadfcf] blur-3xl" />
      <section className="relative mx-auto max-w-2xl text-center" aria-labelledby="coming-soon-title">
        <div className="mb-12 flex justify-center">
          <Logo />
        </div>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#5a7469]">
          Know before you go
        </p>
        <h1 id="coming-soon-title" className="text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
          Coming soon.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-[#50645c] sm:text-xl">
          Palatify is building a more personal way to discover restaurant meals that fit your goals.
        </p>
        <div className="mx-auto mt-12 h-px w-24 bg-[#8aa397]" />
        <p className="mt-6 text-sm text-[#6e7f78]">Boston first · Built with care</p>
      </section>
    </main>
  );
}
