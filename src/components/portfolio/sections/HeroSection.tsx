import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Code,
  Gamepad2,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import RainingLetters from "@/components/ui/modern-animated-hero-section";

class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}=+*^?#";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => {
      this.resolve = resolve;
    });
    this.queue = [];

    for (let i = 0; i < length; i += 1) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 16);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i += 1) {
      const { from, to, start, end } = this.queue[i];
      let { char } = this.queue[i];

      if (this.frame >= end) {
        complete += 1;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="hero-dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
      return;
    }

    this.frameRequest = requestAnimationFrame(this.update);
    this.frame += 1;
  }

  cleanup() {
    cancelAnimationFrame(this.frameRequest);
  }
}

interface ScrambledRoleProps {
  phrases: string[];
  prefersReducedMotion: boolean;
}

function ScrambledRole({ phrases, prefersReducedMotion }: ScrambledRoleProps) {
  const elementRef = React.useRef<HTMLSpanElement>(null);
  const scrambleRef = React.useRef<TextScramble | null>(null);

  React.useEffect(() => {
    if (!elementRef.current || phrases.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      elementRef.current.textContent = phrases[0];
      return;
    }

    scrambleRef.current = new TextScramble(elementRef.current);
    let counter = 0;
    let timeoutId: number | undefined;
    let cancelled = false;

    const run = () => {
      if (!scrambleRef.current || cancelled) {
        return;
      }

      scrambleRef.current.setText(phrases[counter]).then(() => {
        if (cancelled) {
          return;
        }
        timeoutId = window.setTimeout(run, 1400);
      });
      counter = (counter + 1) % phrases.length;
    };

    run();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      scrambleRef.current?.cleanup();
      scrambleRef.current = null;
    };
  }, [phrases, prefersReducedMotion]);

  return (
    <span ref={elementRef} className="inline-block min-h-[2.5rem]">
      {phrases[0] ?? ""}
    </span>
  );
}

interface HeroSectionProps {
  darkMode: boolean;
  name: string;
  headline: string;
  intro: string;
  availability: string;
  tags: string[];
  konamiActivated: boolean;
  onEnterWorkspace: () => void;
}

interface NameClickFeedback {
  token: number;
  count: number;
}

const NAME_HINT_ANIMATION = {
  x: [0, -1.4, 1.4, -1, 0.85, 0],
  rotate: [0, -0.55, 0.55, -0.35, 0.2, 0],
};

const NAME_HINT_TRANSITION = {
  duration: 0.72,
  ease: "easeInOut" as const,
  repeat: Number.POSITIVE_INFINITY,
  repeatDelay: 4.4,
  delay: 2.35,
};

export function HeroSection({
  name,
  headline,
  intro,
  availability,
  tags,
  konamiActivated,
  onEnterWorkspace,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [easterEggOpen, setEasterEggOpen] = React.useState(false);
  const [namePulseToken, setNamePulseToken] = React.useState<number | null>(null);
  const [nameClickCount, setNameClickCount] = React.useState(0);
  const [nameClickFeedback, setNameClickFeedback] = React.useState<NameClickFeedback | null>(null);
  const clickResetTimeoutRef = React.useRef<number | null>(null);
  const easterEggRevealTimeoutRef = React.useRef<number | null>(null);
  const nameClickCountRef = React.useRef(0);
  const workspaceTransitionTimeoutRef = React.useRef<number | null>(null);

  const roleCycle = React.useMemo(() => {
    const values = [headline, ...tags].filter((value) => value.trim().length > 0);
    return Array.from(new Set(values));
  }, [headline, tags]);

  const nameAriaLabel =
    nameClickCount > 0
      ? `Haz tres clicks para abrir el easter egg secreto. Llevas ${nameClickCount} de 3.`
      : "Haz tres clicks para abrir el easter egg secreto";

  const onNameClick = () => {
    if (easterEggRevealTimeoutRef.current) {
      return;
    }

    const token = Date.now() + Math.random();
    const nextCount = nameClickCountRef.current + 1;

    nameClickCountRef.current = nextCount;
    setNameClickCount(nextCount);
    setNamePulseToken(token);
    setNameClickFeedback({ token, count: nextCount });

    if (clickResetTimeoutRef.current) {
      window.clearTimeout(clickResetTimeoutRef.current);
    }

    if (nextCount >= 3) {
      nameClickCountRef.current = 0;
      setNameClickCount(0);
      easterEggRevealTimeoutRef.current = window.setTimeout(() => {
        setEasterEggOpen(true);
        easterEggRevealTimeoutRef.current = null;
      }, prefersReducedMotion ? 0 : 180);
      return;
    }

    clickResetTimeoutRef.current = window.setTimeout(() => {
      nameClickCountRef.current = 0;
      setNameClickCount(0);
    }, 1200);
  };

  const closeEasterEgg = React.useCallback(() => {
    setEasterEggOpen(false);
  }, []);

  const enterWorkspaceFromModal = React.useCallback(() => {
    setEasterEggOpen(false);

    if (workspaceTransitionTimeoutRef.current) {
      window.clearTimeout(workspaceTransitionTimeoutRef.current);
    }

    workspaceTransitionTimeoutRef.current = window.setTimeout(() => {
      onEnterWorkspace();
    }, prefersReducedMotion ? 0 : 180);
  }, [onEnterWorkspace, prefersReducedMotion]);

  React.useEffect(
    () => () => {
      if (clickResetTimeoutRef.current) {
        window.clearTimeout(clickResetTimeoutRef.current);
      }
      if (easterEggRevealTimeoutRef.current) {
        window.clearTimeout(easterEggRevealTimeoutRef.current);
      }
      if (workspaceTransitionTimeoutRef.current) {
        window.clearTimeout(workspaceTransitionTimeoutRef.current);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!easterEggOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEasterEgg();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeEasterEgg, easterEggOpen]);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-screen items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-18">
        <RainingLetters />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(203,166,247,0.16),transparent_62%)]" />
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.55 }}
        className="pointer-events-none absolute right-3 bottom-8 z-[5] hidden rotate-[-10deg] rounded-md border border-border/45 bg-card/25 px-2 py-1 font-mono text-[10px] text-muted-foreground/45 md:block md:right-8 md:bottom-10"
      >
        <span className="inline-flex items-center gap-1">
          <Gamepad2 className="h-3 w-3 text-accent/55" />
          Codigo secreto: 🡱 + 🡱 + 🡳 + 🡳 + 🡰 + 🡲 + 🡰 + 🡲 + B + A.
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 md:flex-row md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-1 flex-col items-center text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <span className="h-3 w-3 animate-pulse rounded-full bg-yellow-500 [animation-delay:120ms]" />
            <span className="h-3 w-3 animate-pulse rounded-full bg-green-500 [animation-delay:240ms]" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">v.1.0.4 loaded</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {availability}
          </div>

          <h1
            id="hero-title"
            className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            <motion.button
              type="button"
              onClick={onNameClick}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01, y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="group relative inline-flex cursor-pointer items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors hover:bg-secondary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={nameAriaLabel}
            >
              <motion.span
                animate={prefersReducedMotion ? undefined : NAME_HINT_ANIMATION}
                transition={prefersReducedMotion ? undefined : NAME_HINT_TRANSITION}
                className="relative inline-flex items-center gap-0.5"
              >
                <span className="text-primary transition-transform duration-200 group-hover:-translate-x-0.5">&lt;</span>
                <span>{name}</span>
                <span className="text-primary transition-transform duration-200 group-hover:translate-x-0.5">/&gt;</span>
              </motion.span>
              <AnimatePresence>
                {namePulseToken ? (
                  <motion.span
                    key={namePulseToken}
                    className="pointer-events-none absolute inset-0 rounded-xl border border-primary/80"
                    initial={{ opacity: 0.68, scale: 0.95 }}
                    animate={{ opacity: 0, scale: 1.16 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setNamePulseToken((currentToken) => (currentToken === namePulseToken ? null : currentToken));
                    }}
                  />
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {nameClickFeedback ? (
                  <motion.span
                    key={nameClickFeedback.token}
                    className="pointer-events-none absolute -right-2 -top-4 inline-flex min-w-[3rem] justify-center rounded-full border border-[#22C55E]/45 bg-background/95 px-2 py-1 font-mono text-xs font-semibold tracking-[0.16em] text-[#22C55E] shadow-[0_14px_32px_rgba(34,197,94,0.18)]"
                    initial={{ opacity: 0, y: 10, scale: 0.82 }}
                    animate={
                      prefersReducedMotion
                        ? { opacity: [0, 1, 0] }
                        : {
                            opacity: [0, 1, 1, 0],
                            y: [10, -4, -16, -28],
                            scale: [0.82, 1, 1.03, 0.94],
                          }
                    }
                    exit={{ opacity: 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.45, times: [0, 0.3, 1], ease: "easeOut" }
                        : { duration: 0.72, ease: "easeOut" }
                    }
                    onAnimationComplete={() => {
                      setNameClickFeedback((currentFeedback) =>
                        currentFeedback?.token === nameClickFeedback.token ? null : currentFeedback
                      );
                    }}
                  >
                    +{nameClickFeedback.count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          </h1>

          <div className="mt-5 flex min-h-[4.25rem] items-center justify-center font-mono text-xl text-foreground/90 md:text-2xl">
            <span className="mr-2 text-primary">$</span>
            <ScrambledRole phrases={roleCycle.length > 0 ? roleCycle : [headline]} prefersReducedMotion={prefersReducedMotion} />
          </div>

          <p className="mt-4 max-w-3xl rounded-2xl border border-primary/30 bg-card/55 px-5 py-4 text-lg text-foreground/85">
            {intro}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#contacto"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[linear-gradient(120deg,var(--primary),var(--accent))] px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageSquare className="h-4 w-4" />
              Contactar
            </a>
            <a
              href="#proyectos"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/60 px-6 py-3 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Code className="h-4 w-4" />
              Ver Proyectos
            </a>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {easterEggOpen ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Cerrar modal easter egg"
              className="absolute inset-0 cursor-pointer bg-background/80 backdrop-blur-sm"
              onClick={closeEasterEgg}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="easter-egg-title"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 270, damping: 24 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_28px_90px_rgba(15,23,42,0.3)] dark:shadow-[0_28px_90px_rgba(15,23,42,0.65)]"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-12 rounded-2xl bg-primary/18" />
              <button
                type="button"
                onClick={closeEasterEgg}
                className="absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/55 text-foreground transition-colors hover:border-primary hover:text-primary"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-primary/45 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Secret Developer Mode
              </div>

              <h3 id="easter-egg-title" className="font-display text-2xl font-bold text-foreground">
                Easter egg encontrado
              </h3>
              <p className="mt-3 text-base text-foreground/90">
                El portfolio va a cambiar al workspace oculto con layout tipo IDE.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa el CTA para entrar al workspace. Overlay, tecla Escape o icono solo cierran este modal.
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={enterWorkspaceFromModal}
/*  */                  className="inline-flex cursor-pointer items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Entrar al workspace
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {konamiActivated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/90 px-4 backdrop-blur-sm"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? { scale: 1 }
                  : {
                      rotate: [0, 6, -6, 0],
                      scale: [1, 1.12, 1],
                    }
              }
              transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-center"
            >
              <div className="mb-4 text-8xl">🎮</div>
              <h2 className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-4xl font-bold text-transparent">
                ¡Konami Code Activado!
              </h2>
              <p className="mt-4 text-xl text-foreground/85">Has desbloqueado un proyecto bonus!</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style>{`
        .hero-dud {
          color: var(--primary);
          opacity: 0.72;
        }
      `}</style>
    </section>
  );
}
