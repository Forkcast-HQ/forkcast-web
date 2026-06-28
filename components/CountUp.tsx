"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | undefined;
    const from = 0;
    const to = value || 0;
    const tick = (t: number) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  return <span className={className}>{prefix}{display}{suffix}</span>;
}
