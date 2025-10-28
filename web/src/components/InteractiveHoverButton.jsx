// web/src/components/InteractiveHoverButton.jsx
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

export default function InteractiveHoverButton({
  to,
  onClick,
  children,
  variant = "primary", // 'primary' | 'outline'
  className = "",
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const base =
    "relative group overflow-hidden rounded-full px-6 py-3 font-semibold transition will-change-transform";
  const styles =
    variant === "primary"
      ? "bg-glds-primary text-zinc-900 hover:shadow-glow"
      : "border border-white/20 text-white hover:bg-white/10";

  const Overlay = (
    <span
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
      style={{
        background: `radial-gradient(160px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,.35), transparent 55%)`,
      }}
    />
  );

  const Inner = <span className="relative z-10">{children}</span>;

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        onMouseMove={onMove}
        className={`${base} ${styles} ${className}`}
      >
        {Overlay}
        {Inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      className={`${base} ${styles} ${className}`}
    >
      {Overlay}
      {Inner}
    </button>
  );
}