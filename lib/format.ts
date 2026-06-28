export const cls = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export const money = (n: number) =>
  `$${n.toFixed(2)}`;

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const pct = (num: number, den: number) =>
  den <= 0 ? 0 : Math.round((num / den) * 100);

export const round = (n: number, dp = 0) => {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
};

export const priceLevelLabel = (lvl: number) => "$".repeat(lvl);

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
