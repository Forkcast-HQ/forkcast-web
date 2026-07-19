"use client";

import { useState } from "react";
import { cls } from "@/lib/format";

// Image with a reliability cascade. lib/images.ts packs a fallback URL into
// the primary URL's hash (`…#fb=<encoded url>`); on load error we swap to it,
// and if that also fails we render the labeled brand-gradient tile so the UI
// always looks intentional.

function fallbackOf(src: string): string | null {
  const i = src.indexOf("#fb=");
  return i === -1 ? null : decodeURIComponent(src.slice(i + 4));
}

export function SmartImage({
  src,
  alt,
  className,
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  label?: string;
}) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    // Prop changed (re-sorted list, new filter) — restart the cascade.
    setPrevSrc(src);
    setCurrent(src);
    setFailed(false);
  }

  const handleError = () => {
    const fb = fallbackOf(current);
    if (fb && fb !== current) setCurrent(fb);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div
        className={cls(
          "flex items-center justify-center bg-gradient-to-br from-brand-200 via-brand-300 to-brand-500",
          className,
        )}
      >
        <span className="px-4 text-center text-sm font-semibold text-brand-900/80">
          {label || alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
}
