import { useCallback, useRef, type MutableRefObject } from "react";

/**
 * Enables reliable horizontal drag-to-scroll inside overflow containers (mobile + desktop),
 * even when the content is made of clickable buttons.
 */
export function useDragScroll<T extends HTMLElement>(externalRef?: MutableRefObject<T | null>) {
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;

  const pointerDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startScrollLeft = useRef(0);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // left click only for mouse
    if (e.pointerType === "mouse" && (e as any).button !== 0) return;

    const el = ref.current;
    if (!el) return;

    pointerDown.current = true;
    moved.current = false;

    startX.current = e.clientX;
    startY.current = e.clientY;
    startScrollLeft.current = el.scrollLeft;

    // keep receiving pointer events even if mouse leaves the element
    if (e.pointerType === "mouse") {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  }, [ref]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    const el = ref.current;
    if (!el) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // only start dragging if it's clearly a horizontal gesture
    if (!moved.current) {
      if (Math.abs(dx) < 4) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      moved.current = true;
    }

    el.scrollLeft = startScrollLeft.current - dx;
  }, [ref]);

  const onPointerUp = useCallback(() => {
    pointerDown.current = false;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    // If the user dragged, cancel the click so it doesn't switch tabs accidentally.
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    const el = ref.current;
    if (!el) return;

    // Only when there's horizontal overflow
    if (el.scrollWidth <= el.clientWidth + 1) return;

    // Prefer native horizontal (trackpads), otherwise map vertical wheel to horizontal.
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!delta) return;

    const prev = el.scrollLeft;
    el.scrollLeft += delta;

    // Prevent page scroll only if we actually scrolled horizontally
    if (el.scrollLeft !== prev) {
      e.preventDefault();
    }
  }, [ref]);

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onClickCapture,
    onWheel,
  };
}
