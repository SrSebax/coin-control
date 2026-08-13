import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "cc_home_tutorial_seen_v2";

// Cada paso puede apuntar a un `data-tour` distinto según el layout: mobile y
// desktop renderizan componentes distintos para el mismo concepto (FAB vs.
// botones del hero, tabbar vs. sidebar, etc.) — ver tutorialSteps.js.
export const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export function useHomeTutorial(steps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (location.pathname !== "/home") return;

    if (location.state?.startTutorial) {
      setStepIndex(0);
      setActive(true);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => {
        setStepIndex(0);
        setActive(true);
      }, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setActive(false);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  return {
    active: active && location.pathname === "/home",
    step: steps[stepIndex],
    stepIndex,
    totalSteps: steps.length,
    next,
    skip: finish,
  };
}
