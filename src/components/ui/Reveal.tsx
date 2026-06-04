/**
 * Reveal.tsx
 *
 * Wrapper de animación de entrada al hacer scroll (fade + slide-up).
 * SOLO presentacional — no toca lógica de negocio. Usa IntersectionObserver
 * nativo (cero dependencias). Respeta `prefers-reduced-motion`.
 *
 * Uso:
 *   <Reveal>...</Reveal>
 *   <Reveal as="section" delay={120}>...</Reveal>
 *   <Reveal delay={i * 80}>{card}</Reveal>   // stagger por índice
 */

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  /** Etiqueta a renderizar (div por defecto). */
  as?: ElementType;
  /** Retardo en ms para escalonar (stagger). */
  delay?: number;
  className?: string;
  /** Margen del root observer; útil para anticipar el reveal. */
  rootMargin?: string;
}

export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  rootMargin = "0px 0px -10% 0px",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si el usuario reduce movimiento, revelar de inmediato sin observar.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // revelar una sola vez
          }
        }
      },
      { threshold: 0.12, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
      style={delay ? { ["--reveal-delay" as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
