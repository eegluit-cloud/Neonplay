import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CounterOptions {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  start?: string;
  ease?: string;
}

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export function useCounterAnimation(options: CounterOptions) {
  const ref = useRef<HTMLElement>(null);
  const {
    target,
    duration = 0.8,
    prefix = "",
    suffix = "",
    decimals = 0,
    start = "top 85%",
    ease = "power1.out",
  } = options;

  useGSAP(
    () => {
      if (!ref.current) return;

      const formatted =
        prefix +
        target.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix;

      if (prefersReducedMotion) {
        ref.current.textContent = formatted;
        return;
      }

      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start,
          once: true,
        },
        onUpdate: () => {
          if (ref.current) {
            const val = decimals > 0 ? counter.val : Math.round(counter.val);
            ref.current.textContent =
              prefix +
              val.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }) +
              suffix;
          }
        },
        onComplete: () => {
          if (ref.current) {
            ref.current.textContent = formatted;
          }
        },
      });
    },
    { scope: ref, dependencies: [target] }
  );

  return ref;
}

export default useCounterAnimation;
