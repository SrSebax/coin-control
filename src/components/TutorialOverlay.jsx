import { useLayoutEffect, useRef, useState } from "react";

const PADDING = 8;

function useTargetRect(active, targetId) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!active || !targetId) {
      setRect(null);
      return;
    }

    let raf;
    let attempts = 0;
    const selector = `[data-tour="${targetId}"]`;

    const measure = (el) => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const tryMeasure = () => {
      const el = document.querySelector(selector);
      if (!el) {
        attempts++;
        if (attempts < 30) raf = requestAnimationFrame(tryMeasure);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "auto" });
      measure(el);
    };

    raf = requestAnimationFrame(tryMeasure);

    const scrollParent = document.querySelector(".overflow-y-auto");
    const onUpdate = () => {
      const el = document.querySelector(selector);
      if (el) measure(el);
    };

    window.addEventListener("resize", onUpdate);
    scrollParent?.addEventListener("scroll", onUpdate, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onUpdate);
      scrollParent?.removeEventListener("scroll", onUpdate);
    };
  }, [active, targetId]);

  return rect;
}

export default function TutorialOverlay({ active, step, stepIndex, totalSteps, onNext, onSkip }) {
  const rect = useTargetRect(active, step?.id);
  const cardRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(150);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [rect, step]);

  if (!active || !step || !rect) return null;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const radius = step.radius ?? 20;

  const spotlightStyle = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
    borderRadius: radius,
    boxShadow: "0 0 0 9999px rgba(4, 12, 10, 0.82)",
  };

  const spaceBelow = viewportH - (rect.top + rect.height + PADDING);
  const spaceAbove = rect.top - PADDING;
  const placeBelow = spaceBelow >= cardHeight + 24 || spaceBelow >= spaceAbove;

  const cardWidth = Math.min(340, viewportW - 32);
  let cardLeft = rect.left + rect.width / 2 - cardWidth / 2;
  cardLeft = Math.max(16, Math.min(cardLeft, viewportW - cardWidth - 16));

  const arrowLeft = Math.max(20, Math.min(rect.left + rect.width / 2 - cardLeft, cardWidth - 20));

  const isLastStep = stepIndex + 1 === totalSteps;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute pointer-events-none" style={spotlightStyle} />

      <div
        ref={cardRef}
        className="absolute rounded-3xl bg-[#0b1a15] border border-white/10 shadow-2xl p-5"
        style={{
          width: cardWidth,
          left: cardLeft,
          top: placeBelow ? rect.top + rect.height + PADDING + 12 : undefined,
          bottom: placeBelow ? undefined : viewportH - (rect.top - PADDING) + 12,
        }}
      >
        <span
          className={`absolute w-4 h-4 bg-[#0b1a15] border-white/10 rotate-45 ${
            placeBelow ? "-top-2 border-t border-l" : "-bottom-2 border-b border-r"
          }`}
          style={{ left: arrowLeft - 8 }}
        />

        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
        <p className="text-sm text-white/70 leading-relaxed mb-5">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Omitir
          </button>
          <button
            type="button"
            onClick={onNext}
            className="cursor-pointer inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#081310] text-sm font-bold transition-colors"
          >
            {isLastStep ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
