import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ScrollStaggerOptions {
  childSelector: string;
  stagger?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
  start?: string;
  onlyVisible?: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const isMobile =
  typeof window !== "undefined" ? window.innerWidth < 768 : false;

export function useScrollStagger<T extends HTMLElement = HTMLDivElement>(
  options: ScrollStaggerOptions
) {
  const ref = useRef<T>(null);
  const {
    childSelector,
    stagger = 0.06,
    duration = isMobile ? 0.35 : 0.4,
    y = isMobile ? 15 : 25,
    x = 0,
    scale,
    ease = "power2.out",
    start = "top 88%",
    onlyVisible = true,
  } = options;

  useGSAP(
    () => {
      if (!ref.current) return;

      const children = ref.current.querySelectorAll(childSelector);
      if (children.length === 0) return;

      if (prefersReducedMotion) {
        gsap.set(children, { opacity: 1, y: 0, x: 0, scale: 1 });
        return;
      }

      // Set initial hidden state
      const fromVars: gsap.TweenVars = { opacity: 0 };
      if (y) fromVars.y = y;
      if (x) fromVars.x = x;
      if (scale !== undefined) fromVars.scale = scale;
      gsap.set(children, fromVars);

      ScrollTrigger.create({
        trigger: ref.current,
        start,
        once: true,
        onEnter: () => {
          const childArray = Array.from(children) as HTMLElement[];

          let toAnimate: HTMLElement[];
          let toSetVisible: HTMLElement[];

          if (onlyVisible) {
            const viewportWidth = window.innerWidth;
            toAnimate = childArray.filter(
              (el) => el.getBoundingClientRect().left < viewportWidth + 100
            );
            toSetVisible = childArray.filter(
              (el) => el.getBoundingClientRect().left >= viewportWidth + 100
            );
          } else {
            toAnimate = childArray;
            toSetVisible = [];
          }

          // Pre-set off-screen horizontal cards to visible
          if (toSetVisible.length > 0) {
            gsap.set(toSetVisible, { opacity: 1, y: 0, x: 0, scale: 1 });
          }

          // Animate visible cards
          if (toAnimate.length > 0) {
            gsap.to(toAnimate, {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              duration,
              stagger,
              ease,
              overwrite: "auto",
            });
          }
        },
      });
    },
    { scope: ref, dependencies: [] }
  );

  return ref;
}

export default useScrollStagger;
