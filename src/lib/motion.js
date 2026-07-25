export const TRANSITIONS = {
  micro: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  reveal: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  hero: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  stagger: 0.1,
  fastStagger: 0.05,
  spring: { type: "spring", stiffness: 300, damping: 24 }
};

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.reveal
  }
};

export const fadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.reveal
  }
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.reveal
  }
};

export const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.reveal
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.hero
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITIONS.reveal },
};

export function slideIn(fromRight = false, distance = 40) {
  return {
    hidden: { opacity: 0, x: fromRight ? distance : -distance },
    visible: { opacity: 1, x: 0, transition: TRANSITIONS.reveal },
  };
}

export function staggerContainer(stagger = TRANSITIONS.stagger, delayChildren = 0) {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const viewportOnce = { once: true, margin: "-10% 0px" };
