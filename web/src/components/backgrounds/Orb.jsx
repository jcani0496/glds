// web/src/components/backgrounds/Orb.jsx
import { useEffect, useRef } from "react";

/**
 * Orb Background (inspirado en Reactbits "Orb")
 * - Canvas con orbes radiales aditivos
 * - Rendimiento: RAF + DPR + limitación de alpha
 * - Respeta prefers-reduced-motion (render estático)
 */
export default function Orb({
  className = "",
  orbs = 12,
  // Colores por defecto: paleta GLDS (dorado) + branding vibrante
  colors = ["#D4B65C", "#FF4D9D", "#39C6F4", "#FFE66B", "#9B5CF6"],
  blur = 140, // desenfoque visual (px)
  alpha = 0.35, // opacidad global por orb
  speed = 0.35, // factor de velocidad
  followMouse = true, // ligera atracción al puntero
}) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const reduced = typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.clientWidth * devicePixelRatio);
    let height = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Crear orbes
    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const ORBS = new Array(orbs).fill(0).map((_, i) => {
      const r = rand(120, 220); // radio del gradiente
      const cx = rand(0, canvas.clientWidth);
      const cy = rand(0, canvas.clientHeight);
      const vx = rand(-1, 1) * speed;
      const vy = rand(-1, 1) * speed;
      const hue = pick(colors);

      // Fase de orbitación para un movimiento orgánico
      const phase = rand(0, Math.PI * 2);
      const amp = rand(12, 24);
      const freq = rand(0.002, 0.008);

      return { r, cx, cy, vx, vy, hue, phase, amp, freq };
    });

    function drawStatic() {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.globalCompositeOperation = "lighter";
      ORBS.forEach((o) => {
        const g = ctx.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.r);
        g.addColorStop(0, hex2rgba(o.hue, alpha));
        g.addColorStop(1, hex2rgba(o.hue, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.globalCompositeOperation = "lighter";

      ORBS.forEach((o, idx) => {
        // Orbitación suave
        o.phase += o.freq;
        const ox = Math.cos(o.phase + idx) * o.amp;
        const oy = Math.sin(o.phase + idx) * o.amp;

        // Movimiento base + orbitación
        o.cx += o.vx + ox * 0.02;
        o.cy += o.vy + oy * 0.02;

        // Atracción sutil al mouse
        if (followMouse && mouseRef.current) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          if (mx || my) {
            o.cx += (mx - o.cx) * 0.0007;
            o.cy += (my - o.cy) * 0.0007;
          }
        }

        // Rebote en bordes
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (o.cx - o.r < -200 || o.cx + o.r > w + 200) o.vx *= -1;
        if (o.cy - o.r < -200 || o.cy + o.r > h + 200) o.vy *= -1;

        // Dibujo
        const g = ctx.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, o.r);
        g.addColorStop(0, hex2rgba(o.hue, alpha));
        g.addColorStop(1, hex2rgba(o.hue, 0));
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(animate);
    }

    function handleResize() {
      width = canvas.width = canvas.clientWidth * devicePixelRatio;
      height = canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      if (reduced) drawStatic();
    }

    function handleMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left);
      mouseRef.current.y = (e.clientY - rect.top);
    }

    window.addEventListener("resize", handleResize);
    if (followMouse) window.addEventListener("mousemove", handleMouse, { passive: true });

    // Primera pasada
    if (reduced) drawStatic();
    else rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      if (followMouse) window.removeEventListener("mousemove", handleMouse);
    };
  }, [alpha, blur, colors, followMouse, orbs, speed, reduced]);

  return (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
      aria-hidden
    >
      <canvas
        ref={ref}
        className="w-full h-full"
        style={{
          filter: `blur(${blur}px) saturate(120%)`,
          willChange: "transform, opacity",
        }}
      />
      {/* Vignette sutil para mejorar contraste del contenido */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
    </div>
  );
}

function hex2rgba(hex, a = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}