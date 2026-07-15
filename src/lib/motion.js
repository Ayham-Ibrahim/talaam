export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export function slideIn(fromRight = false, distance = 40) {
  return {
    hidden: { opacity: 0, x: fromRight ? distance : -distance },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
  };
}

export function staggerContainer(stagger = 0.1, delayChildren = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const viewportOnce = { once: true, amount: 0.25 };
