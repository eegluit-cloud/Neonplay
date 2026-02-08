import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface TextRevealOptions {
  type?: "words" | "chars" | "lines";
  stagger?: number;
  duration?: number;
  y?: number;
  rotateX?: number;
  ease?: string;
  start?: string;
  delay?: number;
  isScrollTriggered?: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const isMobile =
  typeof window !== "undefined" ? window.innerWidth < 768 : false;

export function useTextReveal<T extends HTMLElement = HTMLDivElement>(
  options: TextRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    type = isMobile ? "words" : "words",
    stagger,
    duration = 0.5,
    y = 20,
    rotateX = 0,
    ease = "power2.out",
    start = "top 85%",
    delay = 0,
    isScrollTriggered = true,
  } = options;

  const defaultStagger = type === "chars" ? 0.03 : type === "words" ? 0.05 : 0.08;
  const actualStagger = stagger ?? defaultStagger;

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReducedMotion) {
        gsap.set(ref.current, { opacity: 1 });
        return;
      }

      // Manual text splitting to avoid SplitText dependency issues
      const element = ref.current;
      const originalText = element.textContent || "";
      const ariaLabel = originalText;

      let units: string[];
      if (type === "chars") {
        units = originalText.split("");
      } else if (type === "words") {
        units = originalText.split(/(\s+)/);
      } else {
        units = [originalText];
      }

      // Build split HTML
      element.setAttribute("aria-label", ariaLabel);
      element.innerHTML = units
        .map((unit) => {
          if (/^\s+$/.test(unit)) {
            return unit === " " ? " " : unit;
          }
          return `<span class="split-unit" style="display:inline-block;overflow:hidden"><span class="split-inner" style="display:inline-block" aria-hidden="true">${unit}</span></span>`;
        })
        .join("");

      const innerSpans = element.querySelectorAll(".split-inner");

      const fromVars: gsap.TweenVars = {
        opacity: 0,
        y,
        duration,
        stagger: actualStagger,
        ease,
        delay,
      };

      if (rotateX) {
        fromVars.rotateX = rotateX;
        // Add perspective to parent for 3D effect
        element.style.perspective = "600px";
      }

      if (isScrollTriggered) {
        fromVars.scrollTrigger = {
          trigger: element,
          start,
          once: true,
        };
      }

      gsap.from(innerSpans, fromVars);
    },
    { scope: ref, dependencies: [] }
  );

  return ref;
}

export default useTextReveal;
