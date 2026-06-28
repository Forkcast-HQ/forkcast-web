"use client";

import { useState } from "react";
import { cls } from "@/lib/format";

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
  const [failed, setFailed] = useState(false);

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
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
