import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ScrollRevealProps {
  children: React.ReactNode;
  type?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  type = "fadeUp",
  delay,
  duration,
  className,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>({ type, delay, duration });

  return (
    // @ts-ignore - dynamic tag element
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export default ScrollReveal;
