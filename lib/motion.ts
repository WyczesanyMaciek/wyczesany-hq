// Wyczesany HQ — presety animacji (Motion / Framer Motion).
// Kierunek: sprezyste spring physics, wszystko "odbija" przy hover/click.

import type { Transition, Variants } from "motion/react";

/** Bazowa sprezynka — szybka, wyrazna, lekko odbija. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 22,
  mass: 0.9,
};

/** Delikatniejsza sprezynka — do wjazdu kart. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
  mass: 1,
};

/** Hover na karcie — przesun o 2px w lewo-gore, cien rosnie (w CSS). */
export const cardHover = {
  rest: { x: 0, y: 0 },
  hover: { x: -2, y: -2 },
  tap: { x: 1, y: 1 },
};

/** Wjazd listy — stagger od rodzica do dzieci. */
export const listContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
};

/** Fade + slide dla pojedynczego elementu. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: springSoft },
};
