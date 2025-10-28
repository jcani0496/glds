// src/components/AnimatedBackground.jsx
import { useEffect, useRef } from "react";

/**
 * Fondo Orb inspirado en reactbits.dev
 * - Canvas de baja opacidad con orbes que se mueven lentamente
 * - Respeta prefers-reduced-motion
 * - Colores GLDS con mezcla aditiva
 */
export default function AnimatedBackground({
  opacity = 0.25,
  speed = 0.12,       // velocidad base
  count = 5,          // cantidad de orbes
  colors = ["#D4AF37", "#F5E7C6", "#A8871A"], // paleta GLDS
}) {
  const ref = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let w, h, raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const onR = () => resize();
    window.addEventListener("resize", onR);

    // Orbes
    const orbs = Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 140 + Math.random() * 180,
      vx: (Math.random() * 2 - 1) * speed,
      vy: (Math.random() * 2 - 1) * speed,
      c: colors[i % colors.length],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const o of orbs) {
        // movimiento
        if (!prefersReduced) {
          o.x += o.vx;
          o.y += o.vy;
          if (o.x < -o.r) o.x = w + o.r;
          if (o.x > w + o.r) o.x = -o.r;
          if (o.y < -o.r) o.y = h + o.r;
          if (o.y > h + o.r) o.y = -o.r;
        }

        // gradiente radial
        const g = ctx.createRadialGradient(o.x, o.y, o.r * 0.25, o.x, o.y, o.r);
        g.addColorStop(0, hexToRgba(o.c, opacity));
        g.addColorStop(1, hexToRgba(o.c, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onR);
    };
  }, [opacity, speed, count, colors]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={ref} className="w-full h-full block" />
    </div>
  );
}

function hexToRgba(hex, a = 1) {
  const c = hex.replace("#", "");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}