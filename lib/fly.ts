// Add-to-basket micro-animation: a dot flies from the clicked control to
// the navbar basket icon (#nav-basket). Pure Web Animations API, no deps.
// Skips entirely under prefers-reduced-motion or if the target is hidden.

export function flyToBasket(from: HTMLElement): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("nav-basket");
  if (!target) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (b.width === 0) return; // hidden (mobile menu)

  const dot = document.createElement("div");
  Object.assign(dot.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - 7}px`,
    top: `${a.top + a.height / 2 - 7}px`,
    width: "14px",
    height: "14px",
    borderRadius: "9999px",
    background: "#ec3013",
    zIndex: "9999",
    pointerEvents: "none",
    boxShadow: "0 2px 8px rgba(236,48,19,0.4)",
  });
  document.body.appendChild(dot);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy - 60}px) scale(0.9)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.6 },
    ],
    { duration: 550, easing: "cubic-bezier(0.3, 0, 0.4, 1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    // Nudge the badge
    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "ease-out" },
    );
  };
}
