import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ScrollRevealOptions {
  type?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";
  duration?: number;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
  start?: string;
  once?: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const isMobile =
  typeof window !== "undefined" ? window.innerWidth < 768 : false;

function getFromVars(options: ScrollRevealOptions) {
  const {
    type = "fadeUp",
    y,
    x,
    scale,
  } = options;

  const mobileScale = isMobile ? 0.6 : 1;

  switch (type) {
    case "fadeUp":
      return { opacity: 0, y: y ?? (isMobile ? 15 : 30) };
    case "fadeIn":
      return { opacity: 0 };
    case "scaleIn":
      return { opacity: 0, scale: scale ?? 0.93 };
    case "slideLeft":
      return { opacity: 0, x: x ?? (-30 * mobileScale) };
    case "slideRight":
      return { opacity: 0, x: x ?? (30 * mobileScale) };
    default:
      return { opacity: 0, y: y ?? 30 };
  }
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    duration = isMobile ? 0.4 : 0.5,
    delay = 0,
    ease = "power2.out",
    start = "top 85%",
    once = true,
  } = options;

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReducedMotion) {
        gsap.set(ref.current, { opacity: 1, y: 0, x: 0, scale: 1 });
        return;
      }

      const fromVars = getFromVars(options);

      gsap.from(ref.current, {
        ...fromVars,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start,
          once,
        },
      });
    },
    { scope: ref, dependencies: [] }
  );

  return ref;
}

export default useScrollReveal;
