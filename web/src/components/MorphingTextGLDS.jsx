// web/src/components/MorphingTextGLDS.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Morphing entre textos con ajuste de ancho (auto-fit) SIN escalar hacia arriba.
 * - Mide el ancho de cada texto con la misma tipografía.
 * - Fija el contenedor al ancho máximo.
 * - Escala SOLO para encoger (nunca agranda), así GLDS no se ve más grande que el slogan.
 * - Fuerza una sola línea (nowrap) para el slogan.
 * - Sin barrido dorado (eliminado).
 */
export default function MorphingTextGLDS({
  texts = ["GLDS", "PROMOVEMOS TU MARCA"],
  interval = 2000,
  className = "text-4xl sm:text-5xl font-extrabold tracking-tight",
}) {
  const [i, setI] = useState(0);
  const measureRefs = useRef([]);
  const [sizes, setSizes] = useState({ widths: [], heights: [] });

  // Alterna textos cada `interval`
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % texts.length), interval);
    return () => clearInterval(id);
  }, [interval, texts.length]);

  // Mide anchos/altos con la misma clase tipográfica
  useLayoutEffect(() => {
    const widths = texts.map((_, idx) => measureRefs.current[idx]?.offsetWidth || 0);
    const heights = texts.map((_, idx) => measureRefs.current[idx]?.offsetHeight || 0);
    setSizes({ widths, heights });
  }, [texts, className]);

  const maxW = useMemo(() => Math.max(1, ...(sizes.widths || [])), [sizes.widths]);
  const maxH = useMemo(() => Math.max(1, ...(sizes.heights || [])), [sizes.heights]);

  const currentW = sizes.widths?.[i] || 1;

  // ⬇️ Solo reducimos: si el texto es más largo, lo encogemos; si es corto (GLDS), NO lo agrandamos.
  const fitScale = Math.min(1, maxW / currentW);

  return (
    <div className="inline-grid place-items-center text-center" style={{ width: maxW || "auto" }}>
      {/* Capa visible (reserva altura para evitar saltos de layout) */}
      <div className="col-start-1 row-start-1 relative w-full grid place-items-center" style={{ height: maxH || "auto" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={texts[i]}
            className={`inline-block ${className}`}
            style={{
              transformOrigin: "center",
              whiteSpace: "nowrap", // 👉 fuerza una sola línea
            }}
            initial={{
              opacity: 0,
              filter: "blur(8px)",
              letterSpacing: "0.6em",
              y: 6,
              scale: 0.98 * fitScale,
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              letterSpacing: "0.02em",
              y: 0,
              scale: fitScale,
            }}
            exit={{
              opacity: 0,
              filter: "blur(8px)",
              letterSpacing: "0.6em",
              y: -6,
              scale: 1.02 * fitScale,
            }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {texts[i]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Medidores invisibles (misma tipografía / nowrap) */}
      <div className="invisible absolute -z-10 pointer-events-none">
        {texts.map((t, idx) => (
          <span
            key={`m-${idx}`}
            ref={(el) => (measureRefs.current[idx] = el)}
            className={className}
            style={{ whiteSpace: "nowrap" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}